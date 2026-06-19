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
  if (typeof window.__radarSpawn === "function") {
    window.__radarSpawn();
  }

  const lat = (Math.random() * 160 - 80).toFixed(4);
  const lon = (Math.random() * 360 - 180).toFixed(4);
  const coordsEl = document.querySelector(".coords");
  if (coordsEl) coordsEl.innerText = `LAT ${lat} / LON ${lon}`;
}

(function initGlobe() {
  const canvas = document.getElementById("globe");
  const ctx = canvas.getContext("2d");
  let rotation = 0;
  let beams = [];
  let pulses = [];

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

  function randomSurfacePoint() {
    const lat = Math.random() * 160 - 80;
    const lon = Math.random() * 360 - 180;
    return { lat, lon };
  }

  function spawnBeam() {
    const from = randomSurfacePoint();
    const to = randomSurfacePoint();
    beams.push({ from, to, t: 0, life: 50 + Math.random() * 30 });
  }

  function spawnPulse(lat, lon) {
    pulses.push({ lat, lon, t: 0, life: 45 });
  }

  window.__radarSpawn = function () {
    const p = randomSurfacePoint();
    spawnPulse(p.lat, p.lon);
    if (Math.random() < 0.7) spawnBeam();
  };

  setInterval(() => {
    if (Math.random() < 0.6) spawnBeam();
  }, 700);

  function drawGlobe() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;

    const innerGlow = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.05);
    innerGlow.addColorStop(0, "rgba(57, 255, 140, 0.16)");
    innerGlow.addColorStop(0.7, "rgba(57, 255, 140, 0.05)");
    innerGlow.addColorStop(1, "rgba(57, 255, 140, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1;

    for (let i = 0; i <= LAT_STEPS; i++) {
      const lat = -80 + (160 / LAT_STEPS) * i;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 72; j++) {
        const lon = (j / 72) * 360 - 180;
        const p = project(lat, lon, radius, cx, cy, rotation);
        const alpha = p.z > 0 ? 0.4 : 0.08;
        ctx.strokeStyle = `rgba(57, 255, 140, ${alpha})`;
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
        const alpha = p.z > 0 ? 0.34 : 0.06;
        ctx.strokeStyle = `rgba(57, 255, 140, ${alpha})`;
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
    ctx.strokeStyle = "rgba(57, 255, 140, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    beams = beams.filter((b) => b.t < b.life);
    beams.forEach((b) => {
      const progress = b.t / b.life;
      const from3 = project(b.from.lat, b.from.lon, radius, cx, cy, rotation);
      const to3 = project(b.to.lat, b.to.lon, radius, cx, cy, rotation);

      const midLat = (b.from.lat + b.to.lat) / 2;
      const midLon = (b.from.lon + b.to.lon) / 2;
      const arcHeight = radius * 0.45;
      const midPoint = project(midLat, midLon, radius + arcHeight, cx, cy, rotation);

      const visible = from3.z > -0.3 || to3.z > -0.3;
      if (!visible) {
        b.t += 1;
        return;
      }

      const headT = Math.min(progress * 1.6, 1);
      const tailT = Math.max(headT - 0.35, 0);

      function bezier(t) {
        const x =
          (1 - t) * (1 - t) * from3.x + 2 * (1 - t) * t * midPoint.x + t * t * to3.x;
        const y =
          (1 - t) * (1 - t) * from3.y + 2 * (1 - t) * t * midPoint.y + t * t * to3.y;
        return { x, y };
      }

      ctx.beginPath();
      const steps = 24;
      let drawn = false;
      for (let s = 0; s <= steps; s++) {
        const t = tailT + (headT - tailT) * (s / steps);
        const pt = bezier(t);
        if (!drawn) {
          ctx.moveTo(pt.x, pt.y);
          drawn = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
      ctx.strokeStyle = `rgba(255, 90, 70, ${0.85 * fadeOut})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "rgba(255, 90, 70, 0.9)";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const headPt = bezier(headT);
      if (headT < 1) {
        ctx.beginPath();
        ctx.arc(headPt.x, headPt.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 150, 120, ${fadeOut})`;
        ctx.shadowColor = "rgba(255, 90, 70, 1)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      b.t += 1;
    });

    pulses = pulses.filter((p) => p.t < p.life);
    pulses.forEach((p) => {
      const pos = project(p.lat, p.lon, radius, cx, cy, rotation);
      if (pos.z < -0.2) {
        p.t += 1;
        return;
      }
      const progress = p.t / p.life;
      const ringRadius = 3 + progress * 22;
      const alpha = (1 - progress) * 0.8;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(57, 255, 140, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57, 255, 140, ${1 - progress})`;
      ctx.shadowColor = "rgba(57, 255, 140, 1)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      p.t += 1;
    });

    rotation += 0.0028;
    requestAnimationFrame(drawGlobe);
  }

  drawGlobe();
})();

loadData();
setInterval(loadData, 60000);
