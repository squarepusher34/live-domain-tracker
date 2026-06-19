const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";

let seen = new Set();
let globe;

async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const list = document.getElementById("list");
  const status = document.getElementById("status");

  let newCount = 0;

  data.forEach(d => {
    if (!d.domain || seen.has(d.domain)) return;

    seen.add(d.domain);
    newCount++;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item-domain">${d.domain}</div>
      <div class="item-issuer">${d.issuer}</div>
      <div class="item-time">${d.time}</div>
    `;

    list.prepend(div);
  });

  status.innerText = `LIVE • +${newCount} new`;

  updateGlobe(data);
}

/* 🌍 GLOBE INIT */
function initGlobe() {
  globe = Globe()
    (document.getElementById('globe'))
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('#03050a');

  globe.pointsData([])
    .pointAltitude(0.02)
    .pointRadius(0.2)
    .pointColor(() => '#4da3ff');
}

/* 🌍 UPDATE GLOBE */
function updateGlobe(data) {
  const points = data.slice(0, 50).map(() => ({
    lat: (Math.random() * 180) - 90,
    lng: (Math.random() * 360) - 180,
    size: 0.3
  }));

  globe.pointsData(points);
}

/* START */
initGlobe();
loadData();
setInterval(loadData, 60000);
