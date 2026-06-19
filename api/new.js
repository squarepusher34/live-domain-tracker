export default async function handler(req, res) {
  const r = await fetch("https://crt.sh/?q=%25&output=json");
  const data = await r.json();

  res.status(200).json(data.slice(-50).map(x => ({
    domain: x.name_value,
    time: x.entry_timestamp
  })));
}