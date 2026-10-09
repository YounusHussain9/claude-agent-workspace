#!/usr/bin/env node
// scan-repos.js: rebuilds the AUTO section of workspace.md from the repos linked in this folder.
// Usage: node bin/scan-repos.js
// Reads only package.json, git remote and folder names. Never reads .env files.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const regFile = path.join(root, "workspace.md");
const START = "<!-- AUTO:START (node bin/scan-repos.js rewrites this block) -->";
const END = "<!-- AUTO:END -->";

const STACKS = [
  ["@nestjs/core", "NestJS"], ["express", "Express"], ["next", "Next.js"],
  ["expo", "Expo"], ["react-native", "React Native"], ["vite", "Vite"], ["react", "React"],
];

function sh(cmd, cwd) {
  try { return execSync(cmd, { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; }
}

const rows = [];
for (const name of fs.readdirSync(root).sort()) {
  const dir = path.join(root, name);
  if (name.startsWith(".") || !fs.statSync(dir).isDirectory()) continue;
  if (!fs.existsSync(path.join(dir, ".git"))) continue;
  const remote = sh("git remote get-url origin", dir);
  const org = (remote.match(/[:/]([^/:]+)\/[^/]+?(\.git)?$/) || [])[1] || "-";
  let stack = "-", scripts = "-", pkgName = "-";
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(path.join(dir, "artisan"))) {
    stack = "Laravel (PHP)";
    scripts = "php artisan serve, php artisan test";
  } else if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const found = STACKS.filter(([k]) => deps[k]).map(([, v]) => v);
    stack = found.filter((v) => !(v === "React" && found.length > 1)).join(" + ") || "Node";
    if (deps["@playwright/test"]) stack += " · Playwright";
    if (deps.jest) stack += " · Jest";
    pkgName = pkg.name || "-";
    scripts = Object.keys(pkg.scripts || {}).filter((s) => /^(dev|start|test|test-all|test:e2e|lint)$/.test(s)).join(", ") || "-";
  } else if (fs.existsSync(path.join(dir, "composer.json"))) stack = "PHP";
  else if (fs.existsSync(path.join(dir, "requirements.txt")) || fs.existsSync(path.join(dir, "pyproject.toml"))) stack = "Python";
  const role = /NestJS|Express|PHP|Python/.test(stack) ? "backend" : /Expo|React Native/.test(stack) ? "mobile" : /^(-|Node)$/.test(stack) ? "?" : "frontend";
  const rules = fs.existsSync(path.join(dir, ".claude/rules")) ? "yes" : "no";
  const branch = sh("git branch --show-current", dir) || "-";
  rows.push(`| ${name} | ${role} | ${stack} | ${org} | ${pkgName} | ${scripts} | ${branch} | ${rules} |`);
}

const block = [
  START,
  `_Scanned ${new Date().toISOString().slice(0, 16).replace("T", " ")}. ${rows.length} repos._`,
  "",
  "| Repo | Role | Stack | GitHub org | package | npm scripts | branch now | .claude/rules |",
  "|---|---|---|---|---|---|---|---|",
  ...rows,
  END,
].join("\n");

let text = fs.existsSync(regFile) ? fs.readFileSync(regFile, "utf8") : `# Workspace registry\n\n${START}\n${END}\n`;
const re = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END}`);
text = re.test(text) ? text.replace(re, block) : `${text.trimEnd()}\n\n${block}\n`;
fs.writeFileSync(regFile, text);
console.log(`workspace.md: ${rows.length} repos scanned.`);
