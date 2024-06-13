export async function getDomains(fetch: typeof window.fetch) {
  const r = await fetch(`/api/vpn/domains`);
  const { data } = await r.json();
  return { entries: data };
}
