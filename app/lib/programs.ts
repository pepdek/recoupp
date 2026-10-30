import generated from "./programs.generated.json";
import type { Program } from "./engine";

export const programs = generated as unknown as Program[];
