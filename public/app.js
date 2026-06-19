const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";

let isLoading = false;
let seen = new Set(); // 🔥 sadece yeni kayıtlar

async function loadData() {
  if (isLoading) return;
  isLoading = true;

  const status = document.getElementById("status");
  const list = document.getElementById("list");

  try {
    status.innerText = "Live updating...";

    const res = await fetch(API_URL);
    const data = await res.json();

    let newCount = 0;

    data.forEach(item => {
      if (!item.domain) return;

      const key = item.domain;

      if (seen.has(key)) return;

      seen.add(key);
      newCount++;

      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <b>${item.domain}</b><br>
        <span>${item.issuer}</span><br>
        <small>${item.time}</small>
      `;

      list.prepend(div); // 🔥 üstten ekle (live hissi)
    });

    status.innerText = `Live • +${newCount} new domains`;

  } catch (e) {
    status.innerText = "API error";
    console.error(e);
  }

  isLoading = false;
}

// initial
loadData();

// 🔥 60 saniye live refresh
setInterval(loadData, 60000);
