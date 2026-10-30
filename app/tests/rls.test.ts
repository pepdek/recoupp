// Integration: needs SUPABASE_SERVICE_ROLE_KEY (creates two throwaway users). Skipped otherwise.
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = svc ? describe : describe.skip;

run("RLS: one household can never read or change another's data", () => {
  const admin = () => createClient(url, svc!, { auth: { persistSession: false } });
  let adm: ReturnType<typeof admin>;
  const mk = async (tag: string) => {
    const email = `rls-${tag}-${Date.now()}@example.test`, password = crypto.randomUUID();
    const { data } = await adm.auth.admin.createUser({ email, password, email_confirm: true });
    const c = createClient(url, anon, { auth: { persistSession: false } });
    await c.auth.signInWithPassword({ email, password });
    return { id: data.user!.id, c };
  };
  let A: Awaited<ReturnType<typeof mk>>, B: Awaited<ReturnType<typeof mk>>, hA: string;

  beforeAll(async () => {
    adm = admin();
    [A, B] = await Promise.all([mk("a"), mk("b")]);
    hA = (await A.c.from("households").insert({ owner_id: A.id }).select("id").single()).data!.id;
    await A.c.from("household_members").insert({ household_id: hA, first_name: "A", birth_year: 1950 });
    await A.c.from("consents").insert({ household_id: hA, user_id: A.id, version: "v1" });
  });
  afterAll(async () => { await Promise.all([A, B].map((u) => adm.auth.admin.deleteUser(u.id))); });

  it("B reads nothing of A's", async () => {
    for (const t of ["households", "household_members", "consents", "payments", "audit_log"]) {
      const { data } = await B.c.from(t).select("*");
      expect(data, t).toEqual([]);
    }
  });
  it("B cannot write into A's household", async () => {
    expect((await B.c.from("household_members").insert({ household_id: hA, first_name: "X", birth_year: 1950 })).error).not.toBeNull();
    expect((await B.c.from("consents").insert({ household_id: hA, user_id: B.id, version: "v1" })).error).not.toBeNull();
    expect((await B.c.from("households").insert({ owner_id: A.id })).error).not.toBeNull();
    await B.c.from("households").update({ step: "hacked" }).eq("id", hA);
    await B.c.from("households").delete().eq("id", hA);
    const { data } = await A.c.from("households").select("step").eq("id", hA).single();
    expect(data?.step).toBe("members");
  });
  it("owner cannot be reassigned and consents are immutable", async () => {
    expect((await A.c.from("households").update({ owner_id: B.id }).eq("id", hA)).error).not.toBeNull();
    await A.c.from("consents").update({ version: "v2" }).eq("household_id", hA);
    expect((await A.c.from("consents").select("version").eq("household_id", hA).single()).data?.version).toBe("v1");
  });
  it("anonymous client reads nothing", async () => {
    const anonC = createClient(url, anon, { auth: { persistSession: false } });
    const { data } = await anonC.from("households").select("*");
    expect(data ?? []).toEqual([]);
  });
});
