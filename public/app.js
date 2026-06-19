async function loadData() {
  const search = document.getElementById("search").value;

  let url = "/";

  if (search) {
    url += "?query=" + search;
  }

  document.getElementById("status").innerText = "Loading...";

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

// auto load
loadData();

// refresh every 10 sec
setInterval(loadData, 10000);
