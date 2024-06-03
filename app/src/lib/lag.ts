export async function fullInstall(set: {ip: string, upSpeed: number, downSpeed: number}[]) {
    const response = await fetch("/api/lagger?mode=fullInstall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(set),
    });
    return await response.json();
}

export async function fullDell() {
    const response = await fetch('/api/lagger?mode=fullDell');
    return await response.json();
}

export async function showConfig() {
    const response = await fetch('/api/lagger?mode=showConfig');
    return await response.json();
}

export async function lagIp({upQueueId, downQueueId, upSpeed, downSpeed, oldDownSpeed, oldUpSpeed}:{upQueueId: number, downQueueId: number, upSpeed: number, downSpeed: number, oldUpSpeed: number, oldDownSpeed: number}) {
    const response = await fetch(`/api/lagger?mode=lagIp&upQueueId=${upQueueId}&upSpeed=${upSpeed}&downQueueId=${downQueueId}&downSpeed=${downSpeed}&oldUpSpeed=${oldUpSpeed}&oldDownSpeed=${oldDownSpeed}`);
    return await response.json();
}