# EECS 2021 Fall 2026 — Lab B Solutions (TA demo pack)

Three RISC-V programs matching the Lab B handout, plus a tiny step-tracer so you can
walk the register / memory state like RVS.

## Quick demo

```bash
python3 eecs2021-lab-b/demo/riscv_demo.py all
# or: 1 | 2 | 3
```

## Problem 1 — Expression via shifts

**Expression:** `X = (A - B) * 4 + (C >> 2)` with `A=1024`, `B=256`, `C=-64`.

| Step | Math | Notes |
|------|------|-------|
| A−B | 1024 − 256 = **768** | `sub` |
| ×4 | 768 ≪ 2 = **3072** | `slli`, not `mul` |
| C≫2 | −64 ≫ 2 = **−16** | must be **`srai`** (signed); `srli` would trash the sign |
| sum | 3072 + (−16) = **3056** | `x5 = 0x00000BF0` |

Constraints satisfied: A/B/C in registers, shifts instead of mul/div, result in `x5`, no loads/stores.

## Problem 2 — Pack bytes into a word

Build `x5` so `[31:24]=0xAB`, `[23:16]=0xCD`, `[15:0]=0` → **`0xABCD0000`**.

Allowed ops only: `addi`, `slli`, `srli`, `andi`, `or`.

```
addi x6, x0, 0xAB     # 0x000000AB
slli x6, x6, 24       # 0xAB000000
addi x7, x0, 0xCD     # 0x000000CD
slli x7, x7, 16       # 0x00CD0000
or   x5, x6, x7       # 0xABCD0000
```

Both immediates fit in 12-bit signed `addi` (±2047). Intermediates stay visible in `x6`/`x7`.

## Problem 3 — Memory /4 + sum (no div, no branches)

Handout: read **eight** signed words; starter values listed as **40, 20, 8, 4**.
Only four literals appear on the sheet, so this pack fills the other four with
**16, −8, 12, −4** (still multiples of 4 so `/4` is exact).

Initialize with **`addi` + `sw`** (no `.data` / `.word`), then unroll
`lw` → `srai …, 2` → `sw` eight times. Running sum in `x5`; final `sw` of the sum.

| Addr offset | Loaded | After `srai _, _, 2` |
|-------------|--------|----------------------|
| 0 | 40 | 10 |
| 4 | 20 | 5 |
| 8 | 8 | 2 |
| 12 | 4 | 1 |
| 16 | 16 | 4 |
| 20 | −8 | −2 |
| 24 | 12 | 3 |
| 28 | −4 | −1 |
| 32 (sum) | — | **22** |

## Files

- `solutions/problem1.s`
- `solutions/problem2.s`
- `solutions/problem3.s`
- `demo/riscv_demo.py` — step tracer used for the TA walkthrough
