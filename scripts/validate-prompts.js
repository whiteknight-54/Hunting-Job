#!/usr/bin/env node
const fs = require("fs/promises");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ATS_DIR = path.join(ROOT, "lib", "prompts", "ATS Resume Prompts");
const SECOND_DIR = path.join(ROOT, "lib", "prompts", "second-prompts");

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
  const files = [];
  for (const name of entries) {
    if (!name.endsWith(".txt") || name.startsWith("_")) continue;
    const content = await fs.readFile(path.join(dir, name), "utf8");
    files.push({ name, content });
  }
  return files;
}

function checkFiles(label, files, allowed) {
  const allowedSet = new Set(allowed);
  let ok = true;
  for (const { name, content } of files) {
    const found = extractPlaceholders(content);
    const unknown = found.filter((p) => !allowedSet.has(p));
    if (unknown.length) {
      ok = false;
      console.error(`[${label}] ${name}: unknown placeholders: ${unknown.join(", ")}`);
      console.error(`  allowed: ${allowed.join(", ")}`);
    }
  }
  return ok;
}

async function main() {
  const [atsFiles, secondFiles] = await Promise.all([
    readTxtFiles(ATS_DIR),
    readTxtFiles(SECOND_DIR),
  ]);

  const atsOk = checkFiles("ATS", atsFiles, ATS_PLACEHOLDERS);
  const secondOk = checkFiles("second", secondFiles, SECOND_PLACEHOLDERS);

  if (!atsOk || !secondOk) process.exit(1);
  console.log(
    `OK — ${atsFiles.length} ATS prompt(s), ${secondFiles.length} second prompt(s)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
