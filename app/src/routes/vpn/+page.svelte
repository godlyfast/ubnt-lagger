<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  let requestInProcess = false;
  let outputLog: string[] = [];

  const scanUpdate = async () => {
    requestInProcess = true;
    const res = await fetch("/api/vpn/scan-update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const {data} = await res.json();
    console.log(data);
    const {errData, outData} = data;

    Object.keys(errData).forEach((key) => {
        outputLog.push(`${key}:`);
        errData[key].split('\n').forEach((err: string) => {
            outputLog.push(`${err}`);
        });
    });

    Object.keys(outData).forEach((key) => {
        outputLog.push(`${key}:`);
        outData[key].split('\n').forEach((out: string) => {
            outputLog.push(`${out}`);
        });
    });

    outputLog = [...outputLog];

    requestInProcess = false;
  };
</script>

<h1>VPN</h1>

{#each data?.domains as e}
  <span>{e}</span> <br>
{/each}

<button disabled={requestInProcess} on:click={scanUpdate}>SCAN && UPDATE</button>

<br>

{#each outputLog as row}
    <span>{row}</span> <br>
{/each}
