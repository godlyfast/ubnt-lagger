export async function getDomains(fetch: typeof window.fetch) {
  const r = await fetch(`/api/vpn/domains`);
  const { data } = await r.json();
  return { entries: data };
}

export async function addDomains(fetch: typeof window.fetch, domains: string[]) {
  const r = await fetch(`/api/vpn/domains`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domains }),
  });
  return await r.json();
}

export async function removeDomains(fetch: typeof window.fetch, domains: string[]) {
  const r = await fetch(`/api/vpn/domains`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domains }),
  });
  return await r.json();
}