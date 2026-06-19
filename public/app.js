const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";
let isLoading = false;
let seen = new Set();
let allItems = [];

async function loadData() {
  if (isLoading) return;
  isLoading = true;

  const status = document.getElementById("status");
  const list = document.getElementById("list");
  const refreshBtn = document.querySelector(".btn-refresh");
  refreshBtn.classList.add("spinning");

  try {
    status.innerText = "SYNCING WITH FEED\u2026";

    const res = await fetch(API_URL);
    const data = await res.json();

    let newCount = 0;

    data.forEach(item => {
      if (!item.domain) return;
      const key = item.domain;
      if (seen.has(key)) return;
      seen.add(key);
      newCount++;
      allItems.unshift(item);

      renderItem(item, true);
      pingGlobe();
    });

    if (allItems.length === 0) {
      list.innerHTML = '<div class="empty-row">NO RECORDS YET. WAITING FOR FEED\u2026</div>';
    }

    status.innerText = `LIVE \u2022 +${newCount} NEW DOMAINS THIS CYCLE`;
    updateBadges(newCount);
  } catch (e) {
    status.innerText = "FEED ERROR \u2014 RETRYING ON NEXT CYCLE";
    console.error(e);
  }

  refreshBtn.classList.remove("spinning");
  isLoading = false;
}

function renderItem(item, isNew) {
  const list = document.getElementById("list");
  const div = document.createElement("div");
  div.className = "item";
  div.dataset.domain = item.domain.toLowerCase();

  div.innerHTML = `
    <span class="item-marker">${isNew ? "&#9670;" : "&#9671;"}</span>
    <span class="item-domain">${escapeHtml(item.domain)}<span class="item-issuer">${escapeHtml(item.issuer || "unknown issuer")}</span></span>
    <span class="item-time">${escapeHtml(item.time || "")}</span>
  `;

  list.prepend(div);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateBadges(newCount) {
  document.getElementById("count-badge").innerText = allItems.length;
  document.getElementById("total-seen").innerText = `TRACKED: ${allItems.length}`;
  document.getElementById("rate-badge").innerText = `${newCount}/min`;
}

document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll("#list .item").forEach(row => {
    row.style.display = row.dataset.domain.includes(q) ? "" : "none";
  });
});

function updateClock() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  document.getElementById("clock").innerText = `${hh}:${mm}:${ss} UTC`;
}
setInterval(updateClock, 1000);
updateClock();

function pingGlobe() {
  const stage = document.querySelector(".globe-stage");
  if (!stage) return;

  const ring = document.createElement("div");
  ring.className = "globe-ring active";
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  const radius = Math.min(w, h) * 0.3;
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * radius * 0.7;
  const x = w / 2 + Math.cos(angle) * dist;
  const y = h / 2 + Math.sin(angle) * dist * 0.6;

  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.transform = "translate(-50%, -50%)";
  stage.appendChild(ring);

  setTimeout(() => ring.remove(), 1200);

  const lat = (Math.random() * 160 - 80).toFixed(4);
  const lon = (Math.random() * 360 - 180).toFixed(4);
  const coordsEl = document.querySelector(".coords");
  if (coordsEl) coordsEl.innerText = `LAT ${lat} / LON ${lon}`;
}

(function initGlobe() {
  const canvas = document.getElementById("globe");
  const ctx = canvas.getContext("2d");
  let rotation = 0;

  function resize() {
    const stage = canvas.parentElement;
    canvas.width = stage.clientWidth;
    canvas.height = stage.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const LAT_STEPS = 7;
  const LON_STEPS = 12;

  function project(lat, lon, radius, cx, cy, rot) {
    const phi = (lat * Math.PI) / 180;
    const theta = (lon * Math.PI) / 180 + rot;

    const x3 = Math.cos(phi) * Math.sin(theta);
    const y3 = Math.sin(phi);
    const z3 = Math.cos(phi) * Math.cos(theta);

    return {
      x: cx + x3 * radius,
      y: cy - y3 * radius,
      z: z3,
    };
  }

  function drawGlobe() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;

    ctx.lineWidth = 1;

    for (let i = 0; i <= LAT_STEPS; i++) {
      const lat = -80 + (160 / LAT_STEPS) * i;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 72; j++) {
        const lon = (j / 72) * 360 - 180;
        const p = project(lat, lon, radius, cx, cy, rotation);
        const alpha = p.z > 0 ? 0.32 : 0.08;
        ctx.strokeStyle = `rgba(0, 230, 245, ${alpha})`;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    for (let i = 0; i < LON_STEPS; i++) {
      const lon = (360 / LON_STEPS) * i - 180;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 72; j++) {
        const lat = (j / 72) * 180 - 90;
        const p = project(lat, lon, radius, cx, cy, rotation);
        const alpha = p.z > 0 ? 0.28 : 0.06;
        ctx.strokeStyle = `rgba(0, 230, 245, ${alpha})`;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 230, 245, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    rotation += 0.0028;
    requestAnimationFrame(drawGlobe);
  }

  drawGlobe();
})();

loadData();
setInterval(loadData, 60000);
