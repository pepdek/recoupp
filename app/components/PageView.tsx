"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "./track";

const PRIVATE = /^\/(review|admin|sponsor\/|intake|plan|track|documents|account|login|auth|thanks|api)/;
/** Counts public page views by path only. Skipped on signed-in and household pages. */
export default function PageView() {
  const p = usePathname();
  useEffect(() => { if (!PRIVATE.test(p)) track("page_view", p); }, [p]);
  return null;
}
