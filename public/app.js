async function load() {
  try {
    const res = await fetch("/api/new");
    const data = await res.json();

    document.getElementById("list").innerHTML =
      data.slice(0, 20).map(d =>
        `<p><b>${d.domain}</b></p>`
      ).join("");

  } catch (e) {
    document.getElementById("list").innerHTML =
      "API not ready yet";
  }
}

load();
setInterval(load, 10000);