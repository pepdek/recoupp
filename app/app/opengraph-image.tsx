import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND}: Washington benefits for older adults, found and filled in`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share image for every page: warm field, wordmark, one plain line. Generated, no image files to keep in sync.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#ffc79a 0%,#ff9a52 45%,#f9b21c 100%)", color: "#1b1714" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 64, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 64, background: "radial-gradient(circle at 35% 30%,#ffe9bd,#ffb04a 45%,#ff7a45)" }} />
          {BRAND}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700, maxWidth: 980 }}>Washington has help with food, medicine and bills.</div>
          <div style={{ fontSize: 36, maxWidth: 900 }}>We find it, fill in the forms, and follow each one until it&apos;s decided.</div>
        </div>
      </div>
    ),
    size,
  );
}
