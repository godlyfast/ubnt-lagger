export async function lag({ip, upSpeed, downSpeed}: {ip: string, upSpeed: number, downSpeed: number}) {
    const response = await fetch('/api/lagger?mode=fullInstall&ip=' + ip + '&upSpeed=' + upSpeed + '&downSpeed=' + downSpeed);
    return await response.json();
}

export async function unLag() {
    const response = await fetch('/api/lagger?mode=fullDell');
    return await response.json();
}

export async function showConfig() {
    const response = await fetch('/api/lagger?mode=showConfig');
    return await response.json();
}