#!/usr/bin/env node
// data-count.js: counts records saved by api-get without printing personal data.
// Usage: node bin/data-count.js <saved.json> [--by field.path] [--where field.path=value ...] [--min 5]
//   e.g. node bin/data-count.js docs/data/raw/x.json --by company.name --where status=valid
// Prints totals and grouped counts only. Groups smaller than --min (default 1) are folded into "(other)".
const fs = require("fs");

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.error("usage: node bin/data-count.js <saved.json> [--by field] [--where field=value] [--min N]"); process.exit(2); }
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const get = (o, p) => p.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);

const saved = JSON.parse(fs.readFileSync(file, "utf8"));
let rows = saved.records;
if (!Array.isArray(rows)) { console.error("No record list in this file (api-get saved a single object)."); process.exit(1); }
const wheres = [];
args.forEach((a, i) => { if (a === "--where") wheres.push(args[i + 1].split("=")); });
for (const [k, v] of wheres) rows = rows.filter((r) => String(get(r, k)) === v);

const by = flag("by", "");
const min = Number(flag("min", "1"));
console.log(`source: ${saved.meta.service}:${saved.meta.env} ${saved.meta.path} (fetched ${saved.meta.fetchedAt})`);
console.log(`records: ${saved.records.length}${wheres.length ? ` · after filter ${wheres.map((w) => w.join("=")).join(", ")}: ${rows.length}` : ""}`);
if (!by) process.exit(0);

const groups = new Map();
for (const r of rows) { const k = String(get(r, by) ?? "(empty)"); groups.set(k, (groups.get(k) || 0) + 1); }
let other = 0;
const lines = [...groups].sort((a, b) => b[1] - a[1]).filter(([, n]) => (n >= min ? true : ((other += n), false)));
console.log(`\n| ${by} | count |\n|---|---|`);
for (const [k, n] of lines) console.log(`| ${k} | ${n} |`);
if (other) console.log(`| (other, groups < ${min}) | ${other} |`);
console.log(`| **total** | ${rows.length} |`);
