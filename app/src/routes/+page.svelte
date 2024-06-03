<script lang="ts">
  import JSONTree from "svelte-json-tree";
  import { lagIp, fullDell, fullInstall, showConfig } from "$lib/lag";
  import type { PageData } from "./$types";

  export let data: PageData;
  export let entries: {
    ip: string;
    upSpeed: number;
    downSpeed: number;
  }[] = JSON.parse(JSON.stringify(data.entries));

  $: entries = JSON.parse(JSON.stringify(data.entries));

  let requestInProcess = false;

  async function updateConfig() {
    requestInProcess = true;
    const { data: conf } = await showConfig();
    data = { ...data, entries: conf };
    requestInProcess = false;
  }

  async function handleUnLagClick(entry: any) {}

  async function addEntry() {
    entries = [...entries, { ip: "", upSpeed: 500000, downSpeed: 500000 }];
  }

  async function handleLagAllClick(
    set: { ip: string; upSpeed: number; downSpeed: number }[]
  ) {
    if (requestInProcess) {
      return;
    }
    requestInProcess = true;
    const fi = await fullInstall(set);
    console.log(fi);
    await updateConfig();
    requestInProcess = false;
  }

  async function handleLagClick({
    upSpeed,
    downSpeed,
    ip,
  }: {
    upSpeed: number;
    downSpeed: number;
    ip: string;
  }) {
    if (requestInProcess) {
      return;
    }
    requestInProcess = true;
    const {
      downSpeed: oldDownSpeed,
      upSpeed: oldUpSpeed,
      upQueueId,
      downQueueId,
    } = data.entries.find((e: any) => e.ip === ip);
    const r = await lagIp({
      upQueueId,
      downQueueId,
      upSpeed,
      downSpeed,
      oldDownSpeed,
      oldUpSpeed,
    });
    console.log(r);
    await updateConfig();
    requestInProcess = false;
  }
  async function handleUnLagAllClick() {
    if (requestInProcess) {
      return;
    }
    requestInProcess = true;
    const r = await fullDell();
    console.log(r);
    await updateConfig();
    requestInProcess = false;
  }
</script>

<h1>UBNT Lagger</h1>
{#each entries as entry}
  <input type="text" placeholder="ip" bind:value={entry.ip} />
  <label for="downSpeed">Rate</label>
  <input type="number" placeholder="downSpeed" bind:value={entry.downSpeed} />
  <label for="upSpeed">Reverse Rate</label>
  <input type="number" placeholder="upSpeed" bind:value={entry.upSpeed} />
  <button disabled={requestInProcess} on:click={() => handleLagClick(entry)}
    >SET LAG</button>
  <button disabled={requestInProcess} on:click={() => handleLagClick({...entry, downSpeed: 500, upSpeed: 500})}
    >LAG</button
  >
  <button disabled={requestInProcess} on:click={() => handleLagClick({...entry, downSpeed: 500000, upSpeed: 500000})}
    >UN_LAG</button
  >
  <br />
{/each}
<br />
<button disabled={requestInProcess} on:click={updateConfig}>REFRESH</button>
<button disabled={requestInProcess} on:click={addEntry}>ADD Entry</button>
<button
  disabled={requestInProcess}
  on:click={() => handleLagAllClick(entries)}>LAG ALL</button
>
<button disabled={requestInProcess} on:click={handleUnLagAllClick}
  >UN_LAG ALL</button
>
<JSONTree
  shouldShowPreview={false}
  defaultExpandedLevel={100}
  value={data.entries}
/>
