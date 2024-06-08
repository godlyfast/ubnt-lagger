export async function fullInstall(
  set: { ip: string; upSpeed: number; downSpeed: number }[]
) {
  const response = await fetch("/api/qos?mode=fullInstall", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(set),
  });
  return await response.json();
}

export async function fullDell() {
  const response = await fetch("/api/qos?mode=fullDell");
  return await response.json();
}

export async function showConfig() {
  const response = await fetch("/api/qos?mode=showConfig");
  return await response.json();
}

export async function lagIp({
  upQueueId,
  downQueueId,
  upSpeed,
  downSpeed,
  oldDownSpeed,
  oldUpSpeed,
}: {
  upQueueId: number;
  downQueueId: number;
  upSpeed: number;
  downSpeed: number;
  oldUpSpeed: number;
  oldDownSpeed: number;
}) {
  const response = await fetch(
    `/api/qos?mode=lagIp&upQueueId=${upQueueId}&upSpeed=${upSpeed}&downQueueId=${downQueueId}&downSpeed=${downSpeed}&oldUpSpeed=${oldUpSpeed}&oldDownSpeed=${oldDownSpeed}`
  );
  return await response.json();
}

export async function getEntries(fetch: typeof window.fetch) {
  const r = await fetch(`/api/entries`);
  return { entries: (await r.json()).data };
}
