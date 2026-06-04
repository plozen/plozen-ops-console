import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "design-kit/pub/web");
const target = path.join(projectRoot, "public/design-kit");

if (!existsSync(source)) {
  throw new Error(`design-kit source missing: ${path.relative(projectRoot, source)}`);
}

await fs.rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.cp(source, target, { recursive: true, force: true });

console.log(`SYNC_DESIGN_KIT: ${path.relative(projectRoot, source)} -> ${path.relative(projectRoot, target)}`);
