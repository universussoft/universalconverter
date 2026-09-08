/**
 * Run this snippet in the browser console (or via a javascript_exec-style
 * tool) on a loaded copy of index.html to (re)generate
 * scripts/extracted-data.json — the source data for generate-pages.js.
 *
 * Why a browser and not a plain Node script: index.html builds its final
 * category list (CAT_GROUPS) through several runtime patches — several
 * `Object.assign` merges plus a couple of categories (AWG, Brocas,
 * Astronomia) pushed in dynamically at the very end of the script. Loading
 * the real page guarantees this snippet sees the exact same fully-merged
 * state a visitor does, instead of re-implementing that merge logic here.
 *
 * Steps:
 *   1. node scripts/receive.js scripts/extracted-data.json   (in one terminal)
 *   2. Open index.html (served over http://, not file://) in a browser.
 *   3. Paste this whole snippet into the devtools console and press Enter.
 *   4. Confirm the terminal from step 1 printed "Saved N bytes ...".
 *   5. node scripts/generate-pages.js
 *
 * Re-run this whenever a category or calculator is added to CATEGORIES,
 * NEW_VCATS or CAT_GROUPS, then re-run generate-pages.js to refresh the
 * static c/<slug>/ pages and sitemap.xml.
 */
(async () => {
  const groups = CAT_GROUPS.pt;
  const seen = new Set();
  const order = [];
  Object.entries(groups).forEach(([grpName, keys]) => {
    if (!keys) return;
    keys.forEach(k => {
      if (seen.has(k)) return;
      seen.add(k);
      order.push({ key: k, group: grpName });
    });
  });

  // Known stale CAT_GROUPS references that don't resolve to any real
  // CATEGORIES/NEW_VCATS entry (pre-existing bug, unrelated to this script) —
  // skip them so we don't generate a landing page for a category the app
  // itself can't render.
  const BROKEN = new Set([
    'Corrente Elét.', 'Resistência Elét.', 'Potência Elét.', 'Condutância',
    'Fluxo Magnético', 'Dens. Fluxo Mag.', 'Campo Magnético', 'Cond. Térmica',
  ]);

  const LANGS = ['pt', 'en', 'es', 'fr', 'de', 'zh'];
  const data = order.filter(o => !BROKEN.has(o.key)).map(({ key, group }) => {
    const names = {};
    LANGS.forEach(l => names[l] = catName(key, l));
    const cat = CATEGORIES[key];
    let units = null, kind = 'calculator';
    if (cat) {
      if (cat.rows) {
        units = cat.rows.map(r => r[0]);
        kind = cat.fashion ? 'sizing' : (cat.paperSize ? 'paper' : 'lookup');
      } else if (cat.u) {
        units = ulist(cat);
        kind = cat.special ? 'special' : 'units';
      }
    }
    return { key, group, names, units, kind };
  });

  const json = JSON.stringify(data);
  const res = await fetch('http://localhost:8935/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  });
  console.log(res.status, await res.text(), `(${data.length} entries, ${json.length} bytes)`);
})();
