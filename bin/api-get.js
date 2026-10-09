#!/usr/bin/env node
// api-get.js: the ONLY way Claude reads team APIs. GET requests only.
// Usage: node bin/api-get.js <service> <path> [--env staging|prod] [--query k=v ...] [--pages N] [--page-param page] [--items-key data]
//   e.g. node bin/api-get.js shop /orders --env staging --pages 20
// Base URL and token come from .secrets/tokens.env as <SERVICE>_<ENV>_BASE and <SERVICE>_<ENV>_TOKEN.
// The token is never printed. The response is saved to docs/data/raw/ (git-ignored) and only its
// shape and record count are printed, so personal data never lands in the chat.
// Count/group the saved file with: node bin/data-count.js <file> --by <field>
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const [service, apiPath] = args;
if (!service || !apiPath || apiPath.startsWith("--")) {
  console.error("usage: node bin/api-get.js <service> <path> [--env staging|prod] [--query k=v] [--pages N] [--page-param page] [--items-key data]");
  process.exit(2);
}
if (args.includes("--method") || args.includes("-X")) {
  console.error("api-get only sends GET. Writing to team APIs is not allowed from Claude.");
  process.exit(2);
}

const env = flag("env", "staging");
const secrets = path.join(root, ".secrets", "tokens.env");
if (!fs.existsSync(secrets)) {
  console.error(`Missing .secrets/tokens.env. Copy .secrets/tokens.env.example and ask the approver to fill ${service.toUpperCase()}_${env.toUpperCase()}_BASE/_TOKEN.`);
  process.exit(3);
}
const vars = Object.fromEntries(
  fs.readFileSync(secrets, "utf8").split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]])
);
const key = `${service.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${env.toUpperCase()}`;
const base = vars[`${key}_BASE`];
const token = vars[`${key}_TOKEN`];
if (!base) {
  console.error(`No ${key}_BASE in .secrets/tokens.env. Ask the approver to add it.`);
  process.exit(3);
}

const query = [];
args.forEach((a, i) => { if (a === "--query") query.push(args[i + 1]); });
const pages = Number(flag("pages", "1"));
const pageParam = flag("page-param", "page");
const itemsKey = flag("items-key", "");

function itemsOf(body) {
  if (Array.isArray(body)) return body;
  if (itemsKey) return itemsKey.split(".").reduce((o, k) => (o ? o[k] : undefined), body) || [];
  for (const k of ["data", "items", "results", "records", "rows"]) {
    if (Array.isArray(body?.[k])) return body[k];
    if (Array.isArray(body?.data?.[k])) return body.data[k];
  }
  return null;
}

function shape(v, depth = 0) {
  if (Array.isArray(v)) return v.length ? [shape(v[0], depth + 1)] : [];
  if (v && typeof v === "object") {
    if (depth > 2) return "{…}";
    return Object.fromEntries(Object.entries(v).slice(0, 40).map(([k, x]) => [k, shape(x, depth + 1)]));
  }
  return v === null ? "null" : typeof v;
}

(async () => {
  const all = [];
  let firstBody = null, status = 0;
  for (let p = 1; p <= pages; p++) {
    const url = new URL(base.replace(/\/$/, "") + (apiPath.startsWith("/") ? apiPath : "/" + apiPath));
    for (const q of query) { const [k, ...v] = q.split("="); url.searchParams.set(k, v.join("=")); }
    if (pages > 1) url.searchParams.set(pageParam, String(p));
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    status = res.status;
    if (!res.ok) {
      console.error(`GET ${url.pathname} → HTTP ${res.status}${res.status === 401 || res.status === 403 ? " (token missing, expired or not allowed for this endpoint: ask the approver)" : ""}`);
      process.exit(1);
    }
    const body = await res.json().catch(() => null);
    if (body === null) { console.error(`GET ${url.pathname} → not JSON`); process.exit(1); }
    if (p === 1) firstBody = body;
    const items = itemsOf(body);
    if (!items) { if (p === 1) all.push(body); break; }
    if (items.length === 0) break;
    // An API that ignores the page param returns page 1 again: stop instead of counting it twice.
    if (p > 1 && JSON.stringify(items[0]) === JSON.stringify(all[all.length - items.length])) {
      console.error(`page ${p} repeats page ${p - 1}: the API may not use '${pageParam}'. Stopped; pass --page-param <name>.`);
      break;
    }
    all.push(...items);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.join(root, "docs", "data", "raw");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${stamp}-${service}-${env}-${apiPath.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}.json`);
  const records = itemsOf(firstBody) ? all : null;
  fs.writeFileSync(out, JSON.stringify({ meta: { service, env, path: apiPath, query, pages, fetchedAt: new Date().toISOString(), status }, records, body: records ? undefined : firstBody }, null, 2));

  console.log(`GET ${service}:${env} ${apiPath} → HTTP ${status}`);
  console.log(records ? `records: ${records.length}` : "single object (no list found; pass --items-key if the list is nested)");
  console.log(`saved: ${path.relative(root, out)}`);
  console.log("shape:", JSON.stringify(shape(records ? records[0] ?? {} : firstBody)));
})().catch((e) => { console.error(`api-get failed: ${e.message}`); process.exit(1); });
