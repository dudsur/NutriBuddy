require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// USDA FDC nutrient IDs
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  vitaminC: 1162,
  iron: 1087,
};

/**
 * Queries USDA FoodData Central API for a food name and returns nutrient values from the first result.
 */
async function fetchNutrientsFromUSDA(foodName) {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) throw new Error('USDA_API_KEY is not set');

  const { data } = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
    params: {
      api_key: apiKey,
      query: foodName,
      pageSize: 1,
    },
  });

  const foods = data.foods;
  if (!foods || foods.length === 0) {
    throw new Error(`No results found for "${foodName}"`);
  }

  const first = foods[0];
  const nutrients = first.foodNutrients || [];
  const getVal = (id) => {
    const n = nutrients.find((x) => x.nutrientId === id || x.nutrient?.id === id);
    const raw = n?.value ?? n?.amount;
    return typeof raw === 'number' ? Math.round(raw * 100) / 100 : 0;
  };

  return {
    foodName: first.description || foodName,
    calories: getVal(NUTRIENT_IDS.calories),
    protein: getVal(NUTRIENT_IDS.protein),
    carbs: getVal(NUTRIENT_IDS.carbs),
    fat: getVal(NUTRIENT_IDS.fat),
    vitaminC: getVal(NUTRIENT_IDS.vitaminC),
    iron: getVal(NUTRIENT_IDS.iron),
  };
}

/**
 * Uses Google Gemini to estimate nutrients for a food. Returns same shape as USDA.
 * Set GEMINI_API_KEY in .env to use this instead of USDA.
 */
async function fetchNutrientsFromGemini(foodName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const prompt = `For the food "${foodName}", respond with ONLY a valid JSON object (no markdown, no explanation) with these exact keys and numbers for a typical serving: foodName (string), calories (number), protein (number, grams), carbs (number, grams), fat (number, grams), vitaminC (number, mg), iron (number, mg). Example: {"foodName":"Apple","calories":95,"protein":0.5,"carbs":25,"fat":0.3,"vitaminC":8.4,"iron":0.2}`;

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  );

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`No response from Gemini for "${foodName}"`);

  const raw = JSON.parse(text.trim());
  return {
    foodName: String(raw.foodName ?? foodName),
    calories: Number(raw.calories) || 0,
    protein: Number(raw.protein) || 0,
    carbs: Number(raw.carbs) || 0,
    fat: Number(raw.fat) || 0,
    vitaminC: Number(raw.vitaminC) || 0,
    iron: Number(raw.iron) || 0,
  };
}

/** Picks USDA or Gemini based on which API key is set. */
function fetchNutrients(foodName) {
  if (process.env.GEMINI_API_KEY) return fetchNutrientsFromGemini(foodName);
  if (process.env.USDA_API_KEY) return fetchNutrientsFromUSDA(foodName);
  throw new Error('Set either USDA_API_KEY or GEMINI_API_KEY in .env');
}

const RDI = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  vitaminC: 90,
  iron: 18,
};

// GET / — API info
app.get('/', (req, res) => {
  res.type('text/plain').send(
    'NutriBuddy API is running.\n\n' +
    'Endpoints:\n' +
    '  GET  /api/status  — today\'s nutrients vs recommended\n' +
    '  POST /api/log     — body: { "query": "food name" }'
  );
});

// GET /input (and other app paths) — you're on the API server, not the app
app.get('/input', (req, res) => {
  res.type('text/html').status(200).send(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>NutriBuddy</title></head><body style="font-family:sans-serif;padding:2rem;max-width:480px;">' +
    '<h1>This is the API server</h1>' +
    '<p>The <strong>Log</strong> page (/input) is served by the <strong>Next.js app</strong>, not this server.</p>' +
    '<p>Open the app in your browser (e.g. <strong>http://localhost:3001</strong> if the app runs there, or the URL shown when you run <code>npm run dev</code> in the <code>nutrabuddy</code> folder).</p>' +
    '<p>Use the green <strong>+</strong> button in the app to open the log screen.</p>' +
    '</body></html>'
  );
});

// POST /api/log — search USDA, save to Supabase, return saved row
app.post('/api/log', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env' });
    }
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Body must include { query: "food name" }' });
    }

    const nutrients = await fetchNutrients(query.trim());
    const row = {
      food_name: nutrients.foodName,
      calories: nutrients.calories,
      protein: nutrients.protein,
      carbs: nutrients.carbs,
      fat: nutrients.fat,
      vitamin_c: nutrients.vitaminC,
      iron: nutrients.iron,
    };

    const { data: saved, error } = await supabase
      .from('food_logs')
      .insert(row)
      .select()
      .single();

    if (error) throw error;

    // Map snake_case back to camelCase for response
    res.status(201).json({
      id: saved.id,
      foodName: saved.food_name,
      calories: saved.calories,
      protein: saved.protein,
      carbs: saved.carbs,
      fat: saved.fat,
      vitaminC: saved.vitamin_c,
      iron: saved.iron,
      date: saved.date,
    });
  } catch (err) {
    if (err.message?.includes('USDA_API_KEY') || err.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ error: err.message });
    }
    if (err.message?.includes('No results found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Failed to log food' });
  }
});

// GET /api/status — today's totals vs RDI, return { missing: { protein: 20, ... } }
app.get('/api/status', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const startIso = startOfToday.toISOString();
    const endIso = endOfToday.toISOString();

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat, vitamin_c, iron')
      .gte('date', startIso)
      .lt('date', endIso);

    if (error) throw error;

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      vitaminC: 0,
      iron: 0,
    };

    for (const log of logs || []) {
      totals.calories += Number(log.calories) || 0;
      totals.protein += Number(log.protein) || 0;
      totals.carbs += Number(log.carbs) || 0;
      totals.fat += Number(log.fat) || 0;
      totals.vitaminC += Number(log.vitamin_c) || 0;
      totals.iron += Number(log.iron) || 0;
    }

    const missing = {};
    for (const key of Object.keys(RDI)) {
      const need = RDI[key];
      const have = totals[key] ?? 0;
      const gap = need - have;
      if (gap > 0) missing[key] = Math.round(gap * 100) / 100;
    }

    res.json({ missing, totals, rdi: RDI });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get status' });
  }
});

const PORT = process.env.PORT || 3002;

if (!supabase) {
  console.warn('Warn: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env — /api/log and /api/status will return 500 until set.');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NutriBuddy server running at http://localhost:${PORT}`);
  console.log(`Also try http://127.0.0.1:${PORT} or (on your network) http://<your-ip>:${PORT}`);
});
