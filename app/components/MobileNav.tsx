"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";

export default function MobileNav({ account }: { account: [string, string] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", esc); return () => removeEventListener("keydown", esc); }, []);
  return (
    <div className="xl:hidden">
      <button type="button" className="btn btn-quiet btn-sm" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="menu-panel">
          <ul className="grid gap-1">
            {NAV.map(([h, l]) => <li key={h}><Link href={h} onClick={() => setOpen(false)} className="block py-3 text-lg font-bold text-ink no-underline">{l}</Link></li>)}
            <li><Link href={account[0]} onClick={() => setOpen(false)} className="block py-3 text-lg font-bold text-ink no-underline">{account[1]}</Link></li>
          </ul>
          <Link href="/check" onClick={() => setOpen(false)} className="btn mt-3 w-full">Check what I might qualify for</Link>
        </nav>
      )}
    </div>
  );
}
