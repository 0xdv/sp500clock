# S&P 500 Clock — Election Cycles

**[🔴 Live demo → 0xdv.github.io/sp500clock](https://0xdv.github.io/sp500clock/)**

An interactive chart that overlays every 4-year US presidential election cycle of the S&P 500 since 1928 onto a single canvas — so you can instantly see *where we are now* relative to all of history.

---

## Motivation

The S&P 500 has well-documented **seasonal patterns** that repeat across decades:

- **The Presidential Cycle effect** — Year 1 post-inauguration tends to be weak; Year 3 (pre-election) tends to be the strongest as incumbents stimulate the economy.
- **January effect** — the first month of the year often sets the tone: "as goes January, so goes the year."
- **Q4 rally** — October–December is historically the strongest seasonal stretch.

These patterns are *real but noisy* — they show up clearly in the median but get swamped by macro shocks (2001, 2008, 2020) in individual cycles.

This tool overlays all 24 cycles since 1928 on a single chart so you can see both the signal and the noise at once. The **gold live line** tracks the current cycle daily, letting you judge whether 2025 is following the seasonal script or breaking from it.

---

## What you're looking at

| Element | Meaning |
|---|---|
| Grey lines (faded → bright) | Historical cycles 1928–2020, older = more transparent |
| **Gold line** | Current cycle (Jan 2025 – today), updated live via Yahoo Finance |
| Dashed white line | Median of all historical cycles |
| Vertical dashed lines | Year boundaries within the 4-year cycle |
| Column labels | Post-election · Midterm · Pre-election · Election |

**Hover** over any point to see the cycle year, president, party, and exact % gain/loss from cycle start.

Click **Median** or **2025–now** in the legend to toggle those lines on/off.

---

## Key observations the chart reveals

- **Year 1 (post-election)** is historically the weakest — the market often pulls back as new policies are absorbed.
- **Year 3 (pre-election)** is the strongest on average — incumbents tend to stimulate the economy ahead of voting.
- **Election year (Year 4)** is usually positive, but with more variance than Year 3.
- The 2008–2012 cycle (Obama) is the dramatic dip-and-recovery outlier caused by the Global Financial Crisis.
- Despite the noise, median cumulative return over a full 4-year cycle is comfortably positive.

---

## Stack

- **Pure static HTML / CSS / JavaScript** — no build step, no framework
- **[Chart.js 4](https://www.chartjs.org/)** for rendering
- **Yahoo Finance** (via `corsproxy.io`) for live S&P 500 data
- **GitHub Pages** for hosting (auto-deployed on push to `main`)

---

## Data

Historical daily S&P 500 closes are pre-processed into `historical_cycles.json` and `median_cycle.json`.
Each cycle is normalised so day 0 = 0 % return, making all cycles directly comparable regardless of absolute index level.

The current-cycle data is fetched client-side on every page load — no backend required.

---

## Run locally

```bash
# Any static file server works, e.g.:
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`.

---

## License

MIT
