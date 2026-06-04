import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = path.join(projectRoot, ".next/standalone");
const standaloneNext = path.join(standaloneRoot, ".next");

const copies = [
  {
    source: path.join(projectRoot, "public"),
    target: path.join(standaloneRoot, "public"),
    label: "public",
  },
  {
    source: path.join(projectRoot, ".next/static"),
    target: path.join(standaloneNext, "static"),
    label: ".next/static",
  },
];

if (!existsSync(standaloneRoot)) {
  throw new Error("standalone output missing: run npm run build first");
}

for (const copy of copies) {
  if (!existsSync(copy.source)) {
    throw new Error(`${copy.label} source missing: ${path.relative(projectRoot, copy.source)}`);
  }

  await fs.rm(copy.target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  await fs.mkdir(path.dirname(copy.target), { recursive: true });
  await fs.cp(copy.source, copy.target, { recursive: true, force: true });
}

console.log("PREPARE_STANDALONE_ASSETS: public + .next/static -> .next/standalone");
