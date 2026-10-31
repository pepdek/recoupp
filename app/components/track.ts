// Privacy-friendly funnel events: a name and a page path. No ids, no answers, no cookies.
export function track(name: string, page?: string) {
  try {
    const body = JSON.stringify({ name, page: page ?? location.pathname });
    if (!navigator.sendBeacon?.("/api/event", new Blob([body], { type: "application/json" }))) fetch("/api/event", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch { /* analytics must never break the page */ }
}
