// Tools are solid and calm: one opaque sheet, no blur (see .tool .sheet in globals.css).
export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <div className="tool wrap my-6"><div className="sheet pad">{children}</div></div>;
}
