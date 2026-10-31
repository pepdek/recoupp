// Copies the legal drafts (../docs/legal) into lib/legal.generated.json so the site can render them (run by `prebuild`).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const read = (f: string) => readFileSync(join(import.meta.dirname, "../../docs/legal", f), "utf8");
writeFileSync(join(import.meta.dirname, "../lib/legal.generated.json"), JSON.stringify({ terms: read("TERMS_OF_SERVICE_DRAFT.md"), privacy: read("PRIVACY_POLICY_DRAFT.md") }, null, 1));
console.log("built legal drafts");
