async function loadData() {
  const search = document.getElementById("search").value;

  let url = "https://young-credit-4727.timurayunlu.workers.dev";

  if (search) {
    url += "?query=" + encodeURIComponent(search);
  }

  document.getElementById("status").innerText = "Loading...";

  try {
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

  } catch (err) {
    document.getElementById("status").innerText = "API Error";
    console.error(err);
  }
}

// İlk yükleme
loadData();

// 10 saniyede bir yenile
setInterval(loadData, 10000);
