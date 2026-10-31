export type LedgerEntry = { claim_id: string; kind: "estimated" | "approved" | "received"; annual_value: number; created_at: string };

/**
 * Verified value per claim: the latest approved/received entry (each carries a determination letter or confirmed
 * receipt, enforced by the database). Received supersedes approved only by being later; estimates never count.
 */
export function verifiedByClaim(entries: LedgerEntry[]) {
  const out = new Map<string, number>();
  // same-instant tie: received sorts after approved, matching the SQL (`kind desc`)
  for (const e of [...entries].filter((x) => x.kind !== "estimated").sort((a, b) => a.created_at.localeCompare(b.created_at) || a.kind.localeCompare(b.kind))) out.set(e.claim_id, Number(e.annual_value));
  return out;
}
