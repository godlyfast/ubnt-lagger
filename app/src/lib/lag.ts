export async function lag({ip, upSpeed, downSpeed}: {ip: string, upSpeed: number, downSpeed: number}) {
    const response = await fetch('/api/lagger?mode=fullInstall&ip=' + ip + '&upSpeed=' + upSpeed + '&downSpeed=' + downSpeed);
    return await response.text();
}

export async function unLag() {
    const response = await fetch('/api/lagger?mode=fullDell');
    return await response.text();
}