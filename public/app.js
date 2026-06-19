const API_URL = "https://young-credit-4727.timurayunlu.workers.dev";

async function loadData() {
  const search = document.getElementById("search").value;

  let url = API_URL;

  if (search) {
    url += "?query=" + encodeURIComponent(search);
  }

  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("status").innerText =
    `Loaded ${data.length} records`;

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <b>${item.domain}</b><br>
      ${item.issuer}<br>
      <small>${item.time}</small>
    `;
    list.appendChild(div);
  });
}

loadData();
setInterval(loadData, 10000);
