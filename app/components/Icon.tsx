// Custom icon set v2: 2px stroke, round caps and joins, soft corners. Hand-drawn paths, no library.
const P: Record<string, string> = {
  envelope: "M5 6.5h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2zM4 8.5l8 5.5 8-5.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  alert: "M12 4.2l8.6 15H3.4zM12 10v4M12 17h.01",
  key: "M14.5 3.5a5.5 5.5 0 11-5.2 7.3L4 16.1V20h3.9v-2.3h2.3v-2.3h1.3",
  house: "M4 11l8-6.5 8 6.5M6 9.8V19a1 1 0 001 1h10a1 1 0 001-1V9.8M10 20v-5a2 2 0 014 0v5",
  bag: "M6.5 8h11l1 11a1 1 0 01-1 1h-12a1 1 0 01-1-1zM9 8V7a3 3 0 016 0v1",
  bulb: "M9.5 17.5h5M10 20.5h4M12 3.5a6 6 0 00-3.7 10.7c.7.6 1.2 1.4 1.2 2.3h5c0-.9.5-1.7 1.2-2.3A6 6 0 0012 3.5z",
  bus: "M6 4.5h12a1 1 0 011 1V17a1 1 0 01-1 1H6a1 1 0 01-1-1V5.5a1 1 0 011-1zM5 12h14M8 18v2M16 18v2M8.5 15h.01M15.5 15h.01",
  phone: "M8.5 3h7A1.5 1.5 0 0117 4.5v15a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 19.5v-15A1.5 1.5 0 018.5 3zM11 18h2",
  plug: "M9 3.5V8M15 3.5V8M6.5 8h11v2.5a5.5 5.5 0 01-11 0zM12 16v4.5",
  pill: "M8 16l8-8M10.2 4.7a3.8 3.8 0 015.4 0l3.7 3.7a3.8 3.8 0 010 5.4l-5.5 5.5a3.8 3.8 0 01-5.4 0l-3.7-3.7a3.8 3.8 0 010-5.4z",
  doc: "M7 3.5h6.5L18 8v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V5a1.5 1.5 0 011-1.5zM13.5 3.5V8H18M9 13h6M9 16.5h6",
  upload: "M12 16V5M7.5 9.5L12 5l4.5 4.5M5 15v3a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 18v-3",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 15v3a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 18v-3",
  clock: "M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM12 7.5V12l3 2",
  arrow: "M5 12h14M13 6l6 6-6 6",
  shield: "M12 3.5l7 2.5v5.7c0 4.3-3 7.2-7 8.8-4-1.6-7-4.5-7-8.8V6z",
  lock: "M7 11h10a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0117 20H7a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 017 11zM8.5 11V8.5a3.5 3.5 0 017 0V11",
  plus: "M12 5v14M5 12h14",
  calendar: "M6.5 5h11A1.5 1.5 0 0119 6.5v12a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 18.5v-12A1.5 1.5 0 016.5 5zM5 10h14M8.5 3v4M15.5 3v4",
  qr: "M5 4h5v5H5zM14 4h5v5h-5zM5 14h5v5H5zM14 14h2.5v2.5H14zM19 14v3M14 19.5h3M19.5 20h.01",
  question: "M9.2 9.2a2.9 2.9 0 115 2c-1.2.9-2.2 1.4-2.2 3M12 18h.01",
  pencil: "M5 19l1-4L16.5 4.5a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L9 18zM14.5 6.5l3 3",
};
export const ICONS = Object.keys(P);
export default function Icon({ name, size = 22, label }: { name: string; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="inline-block shrink-0">
      <path d={P[name] ?? P.question} />
    </svg>
  );
}
