<script lang="ts">
  import JSONTree from "svelte-json-tree";
  import { lag, showConfig, unLag } from "$lib/lag";
  import type { PageData } from "./$types";

  export let data: PageData;

  let lagRequestInProcess = false;
  let unLagRequestInProcess = false;

  async function updateConfig() {
    const {data: conf} = await showConfig();
    data = {...data, entries: conf};
    console.log("Upd Conf", data.entries);
  }

  async function handleUnLagClick(entry: any) {
    data.entries = data.entries?.filter((e: any) => e.ip !== entry.ip);
  }

  async function addEntry() {
    data.entries = [...data.entries, { ip: "", upSpeed: 100, downSpeed: 1000 }];
  }
  $: ({ entries } = data);

  async function handleLagClick({ip, upSpeed, downSpeed}: {ip: string, upSpeed: number, downSpeed: number}) {
    if (lagRequestInProcess) {
      return;
    }
    lagRequestInProcess = true;
    const r = await lag({ ip, upSpeed, downSpeed });
    await updateConfig();
    lagRequestInProcess = false;
  }
  async function handleUnLagAllClick() {
    if (unLagRequestInProcess) {
      return;
    }
    unLagRequestInProcess = true;
    const r = await unLag();
    console.log(r);
    await updateConfig();
    unLagRequestInProcess = false;
  }
</script>

<h1>UBNT Lagger</h1>
{#each data.entries.length ? data.entries : [{ip: '192.168.55.69', upSpeed: 100, downSpeed: 1000}] as entry}
  <input type="text" placeholder="ip" bind:value={entry.ip} />
  <label for="downSpeed">Rate</label>
  <input type="number" placeholder="downSpeed" bind:value={entry.downSpeed} />
  <label for="upSpeed">Reverse Rate</label>
  <input type="number" placeholder="upSpeed" bind:value={entry.upSpeed} />
  <button
    disabled={lagRequestInProcess || unLagRequestInProcess}
    on:click={() => handleLagClick(entry)}>LAG IP</button
  >
  <button
    disabled={lagRequestInProcess || unLagRequestInProcess}
    on:click={() => handleUnLagClick(entry)}>UNLAG</button>
  <br />
{/each}
<br />
<button
  disabled={unLagRequestInProcess || lagRequestInProcess}
  on:click={addEntry}>ADD Entry</button>
<button
  disabled={unLagRequestInProcess || lagRequestInProcess}
  on:click={handleUnLagAllClick}>UNLAG ALL</button
>
<JSONTree
  shouldShowPreview={false}
  defaultExpandedLevel={100}
  value={data.entries}
/>
