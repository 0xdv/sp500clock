/* ── helpers ── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── hover animation state ── */
let chartInst = null;
let hoverRafId = null;
let numHistorical = 0;
const origAlpha = [];
const curAlpha  = [];
const tgtAlpha  = [];
const origWidth = [];
const curWidth  = [];
const tgtWidth  = [];

function startHoverLoop() {
  if (hoverRafId) return;
  function tick() {
    let dirty = false;
    for (let i = 0; i < curAlpha.length; i++) {
      const da = tgtAlpha[i] - curAlpha[i];
      const dw = tgtWidth[i] - curWidth[i];
      if (Math.abs(da) > 0.002 || Math.abs(dw) > 0.05) {
        curAlpha[i] += da * 0.18;
        curWidth[i] += dw * 0.18;
        dirty = true;
      } else {
        curAlpha[i] = tgtAlpha[i];
        curWidth[i] = tgtWidth[i];
      }
    }
    if (dirty && chartInst) {
      chartInst.data.datasets.forEach((ds, i) => {
        if (i < numHistorical) {
          ds.borderColor = hexToRgba('#4fa3e0', curAlpha[i]);
          ds.borderWidth = curWidth[i];
        } else {
          ds.borderColor = hexToRgba('#FFD700', curAlpha[i]);
          ds.borderWidth = curWidth[i];
        }
      });
      chartInst.update('none');
    }
    hoverRafId = dirty ? requestAnimationFrame(tick) : null;
  }
  hoverRafId = requestAnimationFrame(tick);
}

function setHover(dsIdx) {
  for (let i = 0; i < tgtAlpha.length; i++) {
    if (dsIdx === -1) {
      tgtAlpha[i] = origAlpha[i];
      tgtWidth[i] = origWidth[i];
    } else if (i === dsIdx) {
      tgtAlpha[i] = Math.min(origAlpha[i] * 1.4 + 0.25, 1.0);
      tgtWidth[i] = i < numHistorical ? 2.8 : origWidth[i];
    } else {
      tgtAlpha[i] = origAlpha[i] * 0.15;
      tgtWidth[i] = origWidth[i];
    }
  }
  startHoverLoop();
}
