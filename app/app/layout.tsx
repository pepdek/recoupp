import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { Footer, Header, SvgDefs } from "@/components/ui";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "WONK"], display: "swap" });
const atkinson = Atkinson_Hyperlegible({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND}: benefits you may be owed`, template: `%s | ${BRAND}` },
  description: "We check Washington benefit programs for you or your parent, fill in the paperwork, and follow it until it's decided.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ui = ((await cookies()).get("ui")?.value ?? "").split(",");
  return (
    <html lang="en" className={`${fraunces.variable} ${atkinson.variable}`} data-lg={ui.includes("lg") ? "" : undefined} data-hc={ui.includes("hc") ? "" : undefined}>
      <body className="flex min-h-screen flex-col">
        <SvgDefs />
        <Header />
        <div id="main" tabIndex={-1} className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
