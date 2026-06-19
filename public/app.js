const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";

let isLoading = false;

async function loadData() {
  if (isLoading) return;
  isLoading = true;

  const search = document.getElementById("search");
  const status = document.getElementById("status");
  const list = document.getElementById("list");

  let url = API_URL;

  if (search?.value.trim()) {
    url += "?query=" + encodeURIComponent(search.value.trim());
  }

  try {
    status.innerText = "Loading...";

    const res = await fetch(url);
    const data = await res.json();

    status.innerText = `Live Domains: ${data.length}`;

    list.innerHTML = "";

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <div style="font-weight:bold;color:#fff">
          ${item.domain}
        </div>
        <div style="color:#aaa;font-size:12px">
          ${item.issuer}
        </div>
        <div style="color:#666;font-size:11px">
          ${item.time}
        </div>
      `;

      list.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    status.innerText = "API Error";
  }

  isLoading = false;
}

// init
loadData();
setInterval(loadData, 10000);

document.addEventListener("keydown", e => {
  if (e.key === "Enter") loadData();
});
