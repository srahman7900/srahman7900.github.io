// Prints visitor totals and the top three countries from GoatCounter as JSON.
// Run by .github/workflows/view-stats.yml; needs GC_SITE and GC_TOKEN.
const site = process.env.GC_SITE;
const token = process.env.GC_TOKEN;
const start = `${process.env.GC_START || '2026-11-01'}T00:00:00Z`;
const end = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

if (!site || !token) {
  console.error('GC_SITE and GC_TOKEN must be set');
  process.exit(1);
}

async function get(path) {
  const url = `https://${site}.goatcounter.com/api/v0${path}?start=${start}&end=${end}&limit=3`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const total = await get('/stats/total');
const locations = await get('/stats/locations');

const countries = (locations.stats || [])
  .filter((s) => /^[A-Za-z]{2}$/.test(s.id || ''))
  .slice(0, 3)
  .map((s) => ({ code: s.id.toLowerCase(), name: s.name, count: s.count }));

console.log(JSON.stringify({ generated: new Date().toISOString(), total: total.total, countries }, null, 2));
