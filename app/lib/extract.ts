import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// The model only proposes values for these fields. It never sees or decides eligibility.
export const FIELDS = [
  "recipient_name", "document_date", "benefit_type", "benefit_amount_monthly",
  "decision", "decision_program", "approved_amount_monthly", "effective_date", "address_line", "account_balance",
] as const;

export const ExtractionSchema = z.object({
  fields: z.array(z.object({
    field: z.enum(FIELDS),
    value: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })),
});

export type Proposed = {
  field: (typeof FIELDS)[number]; value: string; confidence: "high" | "medium" | "low";
  confirmed: boolean; final_value: string | null; confirmed_at: string | null;
};

// Never store SSN-like or long account-like numbers, even if the model returns them.
const SSN = /\b\d{3}-?\d{2}-?\d{4}\b/;
export const isSensitive = (v: string) => SSN.test(v) || /\d{9,}/.test(v.replace(/[\s-]/g, ""));

export function toProposed(raw: z.infer<typeof ExtractionSchema>["fields"]): Proposed[] {
  return raw
    .filter((f) => f.value.trim() && !isSensitive(f.value))
    .map((f) => ({ ...f, value: f.value.trim().slice(0, 200), confirmed: false, final_value: null, confirmed_at: null }));
}

/** The only values anything downstream may read. */
export const confirmedFields = (extracted: Proposed[]) =>
  extracted.filter((f) => f.confirmed && f.final_value).map((f) => ({ field: f.field, value: f.final_value! }));

const SYSTEM = `You read one benefit or financial document and propose values for a fixed list of fields.
Copy only what is printed on the document; omit any field you cannot see. You never judge eligibility.
Never output Social Security numbers, Medicare numbers, account numbers, or dates of birth.
Amounts: plain numbers in US dollars per month, no symbols (convert yearly amounts to monthly only if the document states a monthly figure; otherwise omit).
Dates: YYYY-MM-DD. If the document is a decision letter, set decision to approved, denied, or pending.`;

export const model = () => process.env.EXTRACTION_MODEL ?? "claude-sonnet-5-5";

export async function extract(bytes: Uint8Array, mime: string) {
  const data = Buffer.from(bytes).toString("base64");
  const block = mime === "application/pdf"
    ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data } } as const)
    : ({ type: "image", source: { type: "base64", media_type: mime as "image/jpeg" | "image/png", data } } as const);
  const res = await new Anthropic().messages.parse({
    model: model(), max_tokens: 4000, system: SYSTEM,
    // ponytail: refusals just mark extraction failed (person types values by hand); add server-side fallbacks if refusal rate matters
    output_config: { effort: "low", format: zodOutputFormat(ExtractionSchema) },
    messages: [{ role: "user", content: [block, { type: "text", text: "Propose field values for this document." }] }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("extraction declined");
  return {
    fields: toProposed(res.parsed_output.fields),
    usage: { model: model(), input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
  };
}
