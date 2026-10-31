// Custom icon set: one 2.25 stroke, round caps, every shape left a little open (the quirk).
const P: Record<string, string> = {
  envelope: "M3 6.5l9 6.5 9-6.5M3.2 5.5h17.6v13H3.2z",
  check: "M4 12.5l5 5L20 6.5",
  key: "M14.5 9.5a4.5 4.5 0 11-1.2-3M13.5 11l7 7M18 16.5l2 2M16 14.5l1.8 1.8",
  house: "M3.5 11.5L12 4l8.5 7.5M6 10.5V20h12v-9.5M10 20v-5.5h4V20",
  bag: "M5 8h14l-1 12H6zM9 8V6.5a3 3 0 016 0V8",
  bulb: "M9 17.5h6M10 20.5h4M12 3.5a6 6 0 00-3.5 10.8c.7.6 1 1.3 1 2.2h5c0-.9.3-1.6 1-2.2A6 6 0 0012 3.5z",
  bus: "M5 5h14v12H5zM5 12h14M8 17v2.5M16 17v2.5M8.5 14.5h.01M15.5 14.5h.01",
  phone: "M8 3.5h8v17H8zM11 17.5h2",
  plug: "M9 3.5v5M15 3.5v5M6.5 8.5h11v3a5.5 5.5 0 01-11 0zM12 17v3.5",
  pill: "M7.5 16.5l9-9a3.2 3.2 0 114.5 4.5l-9 9a3.2 3.2 0 11-4.5-4.5zM10 9.5l4.5 4.5",
  doc: "M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15.5h6",
  upload: "M12 16V5M7.5 9.5L12 5l4.5 4.5M4.5 15v4.5h15V15",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M4.5 15v4.5h15V15",
  clock: "M12 3.5a8.5 8.5 0 108.5 8.5M12 7.5V12l3 2",
  arrow: "M4 12h15M13 6l6 6-6 6",
  shield: "M12 3.5l7 2.5v6c0 4.2-3 7.3-7 8.5-4-1.2-7-4.3-7-8.5V6z",
  lock: "M6 11h12v9.5H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  plus: "M12 5v14M5 12h14",
  calendar: "M4 6h16v14H4zM4 10.5h16M8 3.5v4M16 3.5v4",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM19 14v3M14 19.5h3M19.5 20h.01",
  question: "M9 9a3 3 0 115 2c-1.2.9-2 1.4-2 3M12 18.5h.01",
  pencil: "M4.5 19.5l1-4L16 5l3 3L8.5 18.5zM14 7l3 3",
};
export const ICONS = Object.keys(P);
export default function Icon({ name, size = 24, label }: { name: keyof typeof P | string; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="inline-block shrink-0">
      <path d={P[name]} />
    </svg>
  );
}
