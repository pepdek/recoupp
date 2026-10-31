"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCtx } from "@/lib/household";

export async function markClaim(fd: FormData) {
  const { sb, household } = await getCtx("/plan");
  const status = z.enum(["prepared", "submitted"]).parse(fd.get("status"));
  // The database guard also limits households to these two transitions.
  if (household) await sb.from("claims").update({ status }).eq("id", String(fd.get("claim_id"))).eq("household_id", household.id);
  revalidatePath("/plan");
}
