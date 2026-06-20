const API = "https://YOUR-WORKER-URL";

const list = document.getElementById("list");

async function startStream() {
  const res = await fetch(API);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (!line) continue;

      try {
        const data = JSON.parse(line);

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          <div class="item-domain">🟦 ${data.domain}</div>
          <div class="item-issuer">LIVE CERT</div>
          <div class="item-time">${data.time}</div>
        `;

        list.prepend(div);

        // limit memory
        if (list.children.length > 200) {
          list.removeChild(list.lastChild);
        }

      } catch {}
    }
  }
}

startStream();
