#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ATS_DIR = path.join(ROOT, "public", "data", "prompts", "ats");
const SECOND_DIR = path.join(ROOT, "public", "data", "prompts", "second");

const ATS_PLACEHOLDERS = [
  "name",
  "experience",
  "education",
  "jobDescription",
  "questions",
  "roleName",
  "companyName",
];

const SECOND_PLACEHOLDERS = ["jobDescription", "questions", "tailoredResumeContext"];

function extractPlaceholders(template) {
  const found = new Set();
  const re = /\{\{(\w+)\}\}/g;
  let m;
  while ((m = re.exec(String(template || ""))) !== null) found.add(m[1]);
  return [...found];
}

async function readTxtFiles(dir) {
  const entries = await fs.readdir(dir);
  const files = entries.filter((f) => f.endsWith(".txt") && !f.startsWith("_"));
  const out = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(dir, file), "utf8");
    out.push({ id: path.basename(file, ".txt"), content });
  }
  return out;
}

async function checkDir(dir, allowed, label) {
  const prompts = await readTxtFiles(dir);
  let ok = true;
  for (const { id, content } of prompts) {
    const found = extractPlaceholders(content);
    const unknown = found.filter((p) => !allowed.includes(p));
    if (unknown.length) {
      console.error(`${label} ${id}: unknown placeholders: ${unknown.join(", ")}`);
      ok = false;
    }
  }
  return ok;
}

async function main() {
  const atsOk = await checkDir(ATS_DIR, ATS_PLACEHOLDERS, "ATS");
  const secondOk = await checkDir(SECOND_DIR, SECOND_PLACEHOLDERS, "Second");
  if (!atsOk || !secondOk) process.exit(1);
  console.log("All prompt placeholders OK.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
