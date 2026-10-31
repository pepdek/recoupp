import type { Config } from "@netlify/functions";

// Daily trigger for the reminders route (16:00 UTC, about 9am Pacific).
export default async () => {
  const site = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!site || !process.env.CRON_SECRET) return;
  await fetch(`${site}/api/cron/reminders`, { method: "POST", headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
};

export const config: Config = { schedule: "0 16 * * *" };
