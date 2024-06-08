<script lang="ts">
  import JSONTree from "svelte-json-tree";
  import { lagIp, fullDell, fullInstall, showConfig, getEntries } from "$lib/qos";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: PageData;
  let config: any;
  onMount(async () => {
    requestInProcess = true
    const { data: conf } = await showConfig();
    config = conf;
    requestInProcess = false;
  });
  export let entries: {
    ip: string;
    upSpeed: number;
    downSpeed: number;
    name: string;
  }[] = JSON.parse(JSON.stringify(data.entries));

  let requestInProcess = false;

  async function updateData() {
    requestInProcess = true;
    const { data: conf } = await showConfig();
    config = conf;
    requestInProcess = false;
    const data = await getEntries(fetch)
    entries = JSON.parse(JSON.stringify(data.entries));
  }

  async function handleUnLagClick(entry: any) {}

  async function addEntry() {
    entries = [
      ...entries,
      { name: "", ip: "", upSpeed: 500000, downSpeed: 500000 },
    ];
  }

  async function saveEntries() {
    // requestInProcess = true;
    const r = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries }),
    });
    console.log(r);
    // await updateConfig();
    // requestInProcess = false;
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
    await updateData();
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
    } = config.find((e: any) => e.ip === ip);
    const r = await lagIp({
      upQueueId,
      downQueueId,
      upSpeed,
      downSpeed,
      oldDownSpeed,
      oldUpSpeed,
    });
    console.log(r);
    await updateData();
    requestInProcess = false;
  }
  async function handleUnLagAllClick() {
    if (requestInProcess) {
      return;
    }
    requestInProcess = true;
    const r = await fullDell();
    console.log(r);
    await updateData();
    requestInProcess = false;
  }
</script>

<h1>UBNT Lagger</h1>
{#each entries as entry}
  <label for="name">Name</label>
  <input type="text" placeholder="name" bind:value={entry.name} />
  <input type="text" placeholder="ip" bind:value={entry.ip} />
  <label for="downSpeed">Rate</label>
  <input type="number" placeholder="downSpeed" bind:value={entry.downSpeed} />
  <label for="upSpeed">Reverse Rate</label>
  <input type="number" placeholder="upSpeed" bind:value={entry.upSpeed} />
  <button disabled={requestInProcess} on:click={() => handleLagClick(entry)}
    >SET LAG</button
  >
  <button
    disabled={requestInProcess}
    on:click={() => handleLagClick({ ...entry, downSpeed: 500, upSpeed: 500 })}
    >LAG</button
  >
  <button
    disabled={requestInProcess}
    on:click={() =>
      handleLagClick({ ...entry, downSpeed: 500000, upSpeed: 500000 })}
    >UN_LAG</button
  >
  <br />
{/each}
<br />
<button disabled={requestInProcess} on:click={updateData}>REFRESH</button>
<button disabled={requestInProcess} on:click={addEntry}>ADD Entry</button>
<button disabled={requestInProcess} on:click={saveEntries}>Save Entries</button>
<button disabled={requestInProcess} on:click={() => handleLagAllClick(entries)}
  >LAG ALL</button
>
<button disabled={requestInProcess} on:click={handleUnLagAllClick}
  >UN_LAG ALL</button
>
<JSONTree
  shouldShowPreview={false}
  defaultExpandedLevel={100}
  value={config}
/>
