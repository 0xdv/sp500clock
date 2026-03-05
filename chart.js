const TRADING_DAYS_4Y = 252 * 4;
const YEAR_FRAC = 252 / TRADING_DAYS_4Y;   // 0.25

const statusEl = document.getElementById('status');

function setStatus(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.className = isErr ? 'err' : '';
}

/* ── fetch current S&P 500 via corsproxy → Yahoo Finance ── */
async function fetchCurrent() {
  const period1 = Math.floor(new Date('2025-01-01').getTime() / 1000);
  const period2 = Math.floor(Date.now() / 1000);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&period1=${period1}&period2=${period2}`;
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(yahooUrl)}`;
  const resp = await fetch(proxyUrl);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  const closes = json.chart.result[0].indicators.quote[0].close;
  const timestamps = json.chart.result[0].timestamp;

  const pairs = timestamps.map((t, i) => [t, closes[i]]).filter(([,c]) => c != null);
  if (!pairs.length) throw new Error('No data received');

  const filtered = pairs.map(([,c]) => c);
  const lastDate = new Date(pairs[pairs.length - 1][0] * 1000).toLocaleDateString('en-US');
  return { pct: filtered.map(p => parseFloat(((p / filtered[0] - 1) * 100).toFixed(3))), lastDate };
}

/* ── main ── */
async function main() {
  let historicalCycles;
  try {
    const resp = await fetch('historical_cycles.json');
    historicalCycles = await resp.json();
  } catch (e) {
    setStatus('Error loading historical_cycles.json', true);
    return;
  }

  let currentPct = null;
  try {
    setStatus('Loading current data…');
    const result = await fetchCurrent();
    currentPct = result.pct;
    const last = currentPct[currentPct.length - 1];
    setStatus(`Current cycle 2025: ${last >= 0 ? '+' : ''}${last.toFixed(1)}%  ·  Last data: ${result.lastDate}  ·  via Yahoo Finance`);
  } catch (e) {
    setStatus(`Failed to load live data: ${e.message}`, true);
  }

  let medianData = null;
  try {
    const mResp = await fetch('median_cycle.json');
    medianData = await mResp.json();
  } catch (e) {
    console.warn('Could not load median_cycle.json', e);
  }

  buildChart(historicalCycles, currentPct, medianData);
}

main();
