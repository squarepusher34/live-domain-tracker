const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";

async function loadData() {
  const search = document.getElementById("search").value.trim();

  let url = API_URL;

  if (search) {
    url += "?query=" + encodeURIComponent(search);
  }

  const status = document.getElementById("status");
  const list = document.getElementById("list");

  status.innerText = "Loading...";

  try {
    const res = await fetch(url);
    const data = await res.json();

    status.innerText = `Loaded ${data.length} records`;

    list.innerHTML = "";

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <b>${item.domain || "-"}</b><br>
        <span>${item.issuer || "-"}</span><br>
        <small>${item.time || "-"}</small>
      `;

      list.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    status.innerText = "API connection error";
  }
}

// ilk yükleme
loadData();

// auto refresh (canlı hissi)
setInterval(loadData, 10000);

// search enter support
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loadData();
  }
});
