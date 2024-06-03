<h1>UBNT Lagger</h1>
<input type="text" placeholder="ip" bind:value={ip} />
<label for="downSpeed">Rate</label>
<input type="number" placeholder="downSpeed" bind:value={downSpeed} />
<label for="upSpeed">Reverse Rate</label>
<input type="number" placeholder="upSpeed" bind:value={upSpeed} />
<button disabled={lagRequestInProcess || unLagRequestInProcess} on:click={handleLagClick}>LAG IP</button>
<button disabled={unLagRequestInProcess || lagRequestInProcess} on:click={handleUnLagClick}>UNLAG ALL</button>
<JSONTree value={data.config} />
<script lang="ts">
  import JSONTree from 'svelte-json-tree';
  import { lag, unLag } from '$lib/lag';
  import type { PageData } from './$types';
	
	export let data: PageData;

  let lagRequestInProcess = false;
  let unLagRequestInProcess = false;
  let ip: string = '192.168.55.69';
  let upSpeed: number = 100;
  let downSpeed: number = 1000;

  async function handleLagClick() {
    if (lagRequestInProcess) {
      return;
    }
    lagRequestInProcess = true;
    const r = await lag({ip, upSpeed, downSpeed});
    console.log(r);
    lagRequestInProcess = false;
  }
  async function handleUnLagClick() {
    if (unLagRequestInProcess) {
      return;
    }
    unLagRequestInProcess = true;
    const r = await unLag();
    console.log(r);
    unLagRequestInProcess = false;
  }
</script>  