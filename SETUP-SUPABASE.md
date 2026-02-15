# NutriBuddy: Supabase + USDA/Gemini Backend

Use the **Express backend** so logged foods are saved to **Supabase** and nutrients come from **USDA** or **Gemini**.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**: copy **Project URL** and **service_role** key.
3. In **SQL Editor**, run the script in `supabase-food_logs.sql` to create the `food_logs` table.

## 2. Backend env (root folder)

Copy `.env.example` to `.env` in the **NutriBuddy** root and set:

- `SUPABASE_URL` = your Project URL  
- `SUPABASE_SERVICE_ROLE_KEY` = your service_role key  
- `GEMINI_API_KEY` = your Gemini API key (or `USDA_API_KEY` if you use USDA)  
- `PORT=3002` (so the app can use 3000)

## 3. App env (nutrabuddy folder)

In **nutrabuddy**, copy `.env.example` to `.env.local` and set:

- `BACKEND_URL=http://localhost:3002`

## 4. Run both

**Terminal 1 – backend (Supabase + USDA/Gemini):**

```bash
cd C:\Users\surur\OneDrive\Documents\GitHub\NutriBuddy
npm start
```

Backend runs at **http://localhost:3002**.

**Terminal 2 – app:**

```bash
cd C:\Users\surur\OneDrive\Documents\GitHub\NutriBuddy
npm run dev
```

App runs at **http://localhost:3000**. Open that URL, tap +, add a food: the app calls the backend → backend uses Gemini (or USDA) → saves to Supabase → returns nutrients → Today’s progress updates.

## Without backend

If you don’t set `BACKEND_URL`, the app still works: it uses the Next.js **Gemini** route (`GEMINI_API_KEY` in `nutrabuddy/.env.local`) or **estimates** so Today’s progress still updates.
