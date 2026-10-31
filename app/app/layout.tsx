import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Figtree, Instrument_Serif } from "next/font/google";
import { BRAND } from "@/lib/brand";
import FieldBg from "@/components/FieldBg";
import { Footer, Header } from "@/components/ui";
import "./globals.css";

const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND}: benefits you may be owed`, template: `%s | ${BRAND}` },
  description: "We check Washington benefit programs for you or your parent, fill in the paperwork, and follow it until it's decided.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ui = ((await cookies()).get("ui")?.value ?? "").split(",");
  return (
    <html lang="en" className={`${instrument.variable} ${figtree.variable}`} data-lg={ui.includes("lg") ? "" : undefined} data-hc={ui.includes("hc") ? "" : undefined} data-calm={ui.includes("calm") ? "" : undefined}>
      <body className="flex min-h-screen flex-col">
        <FieldBg />
        <Header />
        <div id="main" tabIndex={-1} className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
