/* ── president lookup ── */
const PRESIDENTS = [
  [1923, 'Coolidge',      'R'],
  [1929, 'Hoover',         'R'],
  [1933, 'F.D. Roosevelt', 'D'],
  [1945, 'Truman',         'D'],
  [1953, 'Eisenhower',     'R'],
  [1961, 'Kennedy',        'D'],
  [1963, 'L.B. Johnson',   'D'],
  [1969, 'Nixon',          'R'],
  [1974, 'Ford',           'R'],
  [1977, 'Carter',         'D'],
  [1981, 'Reagan',         'R'],
  [1989, 'Bush Sr.',       'R'],
  [1993, 'Clinton',        'D'],
  [2001, 'Bush Jr.',       'R'],
  [2009, 'Obama',          'D'],
  [2017, 'Trump',          'R'],
  [2021, 'Biden',          'D'],
  [2025, 'Trump',          'R'],
];
function getPresident(year) {
  let res = PRESIDENTS[0];
  for (const e of PRESIDENTS) { if (e[0] <= year) res = e; else break; }
  return res;
}

/* ── year-boundary overlay plugin ── */
Chart.register({
  id: 'yearlines',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales.x) return;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const px = scales.x.getPixelForValue(i * YEAR_FRAC);
      ctx.beginPath();
      ctx.moveTo(px, chartArea.top);
      ctx.lineTo(px, chartArea.bottom);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = '14px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    const yearLabels = ["Post-election", "Midterm", "Pre-election", "Election"];
    for (let i = 0; i < 4; i++) {
      const cx = scales.x.getPixelForValue((i + 0.5) * YEAR_FRAC);
      ctx.fillText(yearLabels[i], cx, chartArea.top - 5);
    }
    ctx.restore();
  },
});

/* ── build chart ── */
let medianDsIndex = -1;

function buildChart(historicalCycles, currentPct, medianData) {
  const ctx = document.getElementById('chart').getContext('2d');
  const n = historicalCycles.length;

  numHistorical = n;
  origAlpha.length = 0; curAlpha.length = 0; tgtAlpha.length = 0;
  origWidth.length = 0; curWidth.length = 0; tgtWidth.length = 0;

  const datasets = historicalCycles.map((c, idx) => {
    const alpha = parseFloat((0.08 + 0.62 * (idx / (n - 1))).toFixed(3));
    origAlpha.push(alpha); curAlpha.push(alpha); tgtAlpha.push(alpha);
    origWidth.push(1.2);   curWidth.push(1.2);   tgtWidth.push(1.2);
    return {
      label: c.year.toString(),
      data: c.x.map((x, i) => ({ x, y: c.pct[i] })),
      borderColor: hexToRgba('#4fa3e0', alpha),
      borderWidth: 1.2,
      pointRadius: 0,
      tension: 0.2,
      showLine: true,
    };
  });

  if (medianData) {
    medianDsIndex = datasets.length;
    origAlpha.push(0.9); curAlpha.push(0.9); tgtAlpha.push(0.9);
    origWidth.push(2.5); curWidth.push(2.5); tgtWidth.push(2.5);
    datasets.push({
      label: 'Median',
      data: medianData.x.map((x, i) => ({ x, y: medianData.pct[i] })),
      borderColor: 'rgba(255,255,255,0.9)',
      borderWidth: 2.5,
      borderDash: [6, 3],
      pointRadius: 0,
      tension: 0.2,
      showLine: true,
      order: -2,
    });
  }

  if (currentPct && currentPct.length) {
    const xs = Array.from({ length: currentPct.length }, (_, i) => i / TRADING_DAYS_4Y);
    origAlpha.push(1.0); curAlpha.push(1.0); tgtAlpha.push(1.0);
    origWidth.push(2.5); curWidth.push(2.5); tgtWidth.push(2.5);
    datasets.push({
      label: '2025 (current)',
      data: xs.map((x, i) => ({ x, y: currentPct[i] })),
      borderColor: '#FFD700',
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.15,
      showLine: true,
      order: -1,
    });
  }

  chartInst = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 18 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'nearest',
          intersect: false,
          callbacks: {
            title: items => {
              const d = items[0].dataset;
              const x = items[0].parsed.x;
              if (d.label === 'Median') return 'Median (all cycles)';
              const startYear = parseInt(d.label);
              if (isNaN(startYear)) return d.label;
              const curYear = Math.floor(startYear + x * 4);
              const [, name, party] = getPresident(curYear);
              return `${curYear}  ·  ${name} (${party})`;
            },
            label: item => `${item.parsed.y >= 0 ? '+' : ''}${item.parsed.y.toFixed(1)}%`,
          },
          backgroundColor: 'rgba(22,27,34,0.92)',
          borderColor: '#444',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#cdd9e5',
        },
      },
      scales: {
        x: {
          type: 'linear', min: 0, max: 1,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            color: '#8b949e',
            callback: v => {
              const labels = { 0: 'Election', 0.25: '+1 year', 0.5: '+2 years', 0.75: '+3 years', 1: '+4 years' };
              return labels[v] ?? '';
            },
            stepSize: 0.25,
          },
          border: { color: '#444' },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: '#8b949e', callback: v => `${v > 0 ? '+' : ''}${v}%` },
          border: { color: '#444' },
        },
      },
      backgroundColor: '#0d1117',
    },
  });

  const canvas = document.getElementById('chart');
  let lastHoveredDs = -1;
  canvas.addEventListener('mousemove', e => {
    const elems = chartInst.getElementsAtEventForMode(e, 'nearest', { intersect: false }, false);
    const dsIdx = elems.length ? elems[0].datasetIndex : -1;
    if (dsIdx !== lastHoveredDs) { lastHoveredDs = dsIdx; setHover(dsIdx); }
  });
  canvas.addEventListener('mouseleave', () => { lastHoveredDs = -1; setHover(-1); });

  /* ── wire HTML legend toggles ── */
  function bindLegendToggle(elId, dsIndex) {
    if (dsIndex < 0) return;
    const el = document.getElementById(elId);
    if (!el) return;
    el.addEventListener('click', () => {
      const ds = chartInst.data.datasets[dsIndex];
      ds.hidden = !ds.hidden;
      el.classList.toggle('off', ds.hidden);
      chartInst.update();
    });
  }
  bindLegendToggle('legend-median', medianDsIndex);
  const currentDsIndex = datasets.length - 1;       // current is always last
  if (currentPct && currentPct.length) bindLegendToggle('legend-current', currentDsIndex);
}
