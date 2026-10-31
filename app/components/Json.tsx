/** JSON-LD for search and AI assistants. Only data that is also visible on the page. */
export default function Json({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
