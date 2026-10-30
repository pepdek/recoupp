// Validates ../programs/*.yaml and writes lib/programs.generated.json (run by `prebuild`). Fails the build on any invalid program.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { ProgramSchema, type Program } from "../lib/engine";

const dir = join(import.meta.dirname, "../../programs");
const programs: Program[] = readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort().map((f) => {
  const text = readFileSync(join(dir, f), "utf8");
  const r = ProgramSchema.safeParse(parse(text));
  if (!r.success) throw new Error(`${f}: ${r.error.message}`);
  if (f !== `${r.data.id}.yaml`) throw new Error(`${f}: file name must match id ${r.data.id}`);
  return { ...r.data, version: createHash("sha256").update(text).digest("hex").slice(0, 12) };
});
writeFileSync(join(import.meta.dirname, "../lib/programs.generated.json"), JSON.stringify(programs, null, 1));
console.log(`built ${programs.length} programs`);
