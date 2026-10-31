// Tiny renderer for our legal drafts: "# " titles are dropped (the page has its own H1), blank-line paragraphs, "- " lists, **bold**.
function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((t, i) => (t.startsWith("**") ? <strong key={i}>{t.slice(2, -2)}</strong> : t));
}
export default function Md({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b && !b.startsWith("# "));
  return (
    <div className="stack">
      {blocks.map((b, i) => b.split("\n").every((l) => l.startsWith("- ")) ? (
        <ul key={i} className="ml-5 list-disc stack">{b.split("\n").map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>
      ) : <p key={i}>{inline(b.replace(/\n/g, " "))}</p>)}
    </div>
  );
}
