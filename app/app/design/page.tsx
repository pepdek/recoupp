import type { Metadata } from "next";
import { ICONS } from "@/components/Icon";
import { Icon, Pill, Strip, Wordmark, money } from "@/components/ui";

export const metadata: Metadata = { title: "Design specimen", robots: { index: false } };
const swatch: [string, string, string][] = [["paper", "bg-paper", "#F4ECD8"], ["paper-2", "bg-paper-2", "#E9DFC5"], ["ink", "bg-ink text-paper", "#1E1B16"], ["forest", "bg-forest text-paper", "#2F4A2B"], ["pill", "bg-pill text-paper", "#B5381A"], ["mustard", "bg-mustard", "#E0A921"]];

export default function Specimen() {
  return (
    <main className="wrap my-6"><div className="glass pad space-y-12">
      <header><p className="small font-bold uppercase tracking-widest">Design specimen</p><h1 className="mt-2">Tokens and parts</h1><div className="mt-4"><Wordmark size="3rem" /></div></header>

      <section aria-labelledby="c"><h2 id="c">Color</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{swatch.map(([n, c, h]) => <li key={n} className={`${c} rounded-2xl p-3`}><b>{n}</b><br /><span className="small">{h}</span></li>)}</ul></section>

      <section aria-labelledby="t"><h2 id="t">Type</h2>
        <p className="bignum mt-4">{money(2435)}</p>
        <h1 className="mt-4">Heading one, Fraunces</h1><h2 className="mt-2">Heading two</h2><h3 className="mt-2">Heading three</h3>
        <p className="mt-2">Body text is Atkinson Hyperlegible at 20px for households. 0O 1lI. The quick brown fox.</p>
        <p className="small mt-2">Small text, 17px.</p></section>

      <section aria-labelledby="b"><h2 id="b">Buttons and fields</h2>
        <p className="mt-4 flex flex-wrap gap-4"><button className="btn">Primary</button><button className="btn btn-quiet">Quiet</button><button className="btn btn-forest">Forest</button><button className="btn btn-sm">Small</button><button className="linkbtn">Link button</button></p>
        <form className="mt-4 max-w-md space-y-4"><label className="field">Label<span className="hint">Hint text goes here.</span><input className="input" defaultValue="Value" /></label>
          <label className="check"><input type="checkbox" defaultChecked />Checkbox row</label><p role="alert" className="err">Something to fix, said plainly.</p></form></section>

      <section aria-labelledby="s"><h2 id="s">Pills and progress</h2>
        <p className="mt-4 flex flex-wrap gap-4">{["recommended", "submitted", "approved", "needs_info", "renewal_due", "receiving"].map((s) => <Pill key={s} status={s} />)}</p>
        <div className="mt-6 max-w-md"><Strip total={9} current={4} /></div></section>

      <section aria-labelledby="k"><h2 id="k">Tiles, balance, toast</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="ticket"><h3>Medicare Savings Program</h3><p className="display mt-2 text-4xl">About {money(2435)}<span className="small ml-2 font-sans font-normal">a year</span></p><p className="mt-2">Pays the Part B premium.</p></div>
          <div className="slip"><h3>Printed terms</h3><p className="mt-2">Dashed edge, paper-2 fill.</p></div>
          <div className="cheque"><p className="small font-bold uppercase tracking-widest">Pay to the order of you</p><div className="line mt-2"><span className="amount">{money(2546)}</span><span className="small font-bold">a year</span></div></div>
          <div className="toast" role="status">Saved. Your answers are safe.</div></div></section>

      <section aria-labelledby="tb" className="tool"><h2 id="tb">Table</h2>
        <table className="tbl mt-4"><thead><tr><th>Program</th><th className="num">Claims</th><th className="num">Verified a year</th></tr></thead><tbody><tr><td>Basic Food</td><td className="num">17</td><td className="num">{money(4310)}</td></tr><tr><td>Lifeline</td><td className="num">9</td><td className="num">{money(777)}</td></tr></tbody></table></section>

      <section aria-labelledby="i"><h2 id="i">Icons ({ICONS.length})</h2>
        <ul className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-7">{ICONS.map((n) => <li key={n} className="box flex items-center gap-2"><Icon name={n} size={28} /><span className="small">{n}</span></li>)}</ul></section>
    </div></main>
  );
}
