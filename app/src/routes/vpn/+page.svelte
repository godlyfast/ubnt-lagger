<script lang="ts">
  import type { PageData } from "./$types";
  import { addDomains, removeDomains } from "$lib/client/vpn";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;

  let requestInProcess = false;
  let outputLog: string[] = [];
  let domainsToAdd: string[] = [];
  let errorMessage = "";
  let successMessage = "";

  const saveDomains = async () => {
    const validDomains = domainsToAdd.filter((d) => d.trim().length > 0);

    if (validDomains.length === 0) {
      errorMessage = "Please enter at least one domain";
      setTimeout(() => errorMessage = "", 3000);
      return;
    }

    requestInProcess = true;
    errorMessage = "";
    successMessage = "";

    try {
      await addDomains(fetch, validDomains);
      successMessage = `Successfully added ${validDomains.length} domain(s)`;
      domainsToAdd = [];
      await invalidateAll();
      setTimeout(() => successMessage = "", 3000);
    } catch (e: any) {
      errorMessage = `Failed to add domains: ${e.message}`;
      setTimeout(() => errorMessage = "", 5000);
    } finally {
      requestInProcess = false;
    }
  };

  const removeDomain = async (domain: string) => {
    if (!confirm(`Remove domain "${domain}"?`)) {
      return;
    }

    requestInProcess = true;
    errorMessage = "";
    successMessage = "";

    try {
      await removeDomains(fetch, [domain]);
      successMessage = `Successfully removed "${domain}"`;
      await invalidateAll();
      setTimeout(() => successMessage = "", 3000);
    } catch (e: any) {
      errorMessage = `Failed to remove domain: ${e.message}`;
      setTimeout(() => errorMessage = "", 5000);
    } finally {
      requestInProcess = false;
    }
  };

  const scanUpdate = async () => {
    requestInProcess = true;
    outputLog = [];
    const res = await fetch("/api/vpn/scan-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { data } = await res.json();
    console.log(data);
    const { errData, outData } = data;

    Object.keys(errData).forEach((key) => {
      outputLog.push(`${key}:`);
      errData[key].split("\n").forEach((err: string) => {
        outputLog.push(`${err}`);
      });
    });

    Object.keys(outData).forEach((key) => {
      outputLog.push(`${key}:`);
      outData[key].split("\n").forEach((out: string) => {
        outputLog.push(`${out}`);
      });
    });

    outputLog = [...outputLog];

    requestInProcess = false;
  };
</script>

<h1>VPN Domain Management</h1>

{#if errorMessage}
  <div style="background-color: #ffcccc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #cc0000;">
    {errorMessage}
  </div>
{/if}

{#if successMessage}
  <div style="background-color: #ccffcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #006600;">
    {successMessage}
  </div>
{/if}

<h2>Existing Domains</h2>
{#if data?.domains && data.domains.length > 0}
  {#each data.domains as domain}
    <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
      <span style="min-width: 200px;">{domain}</span>
      <button
        disabled={requestInProcess}
        on:click={() => removeDomain(domain)}
        style="background-color: #cc0000; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;"
      >
        Remove
      </button>
    </div>
  {/each}
{:else}
  <p style="color: #666;">No domains configured yet.</p>
{/if}

<h2 style="margin-top: 30px;">Add New Domains</h2>
{#each domainsToAdd as e, i}
  <div style="margin: 5px 0; display: flex; align-items: center; gap: 10px;">
    <input
      type="text"
      bind:value={e}
      placeholder="example.com"
      style="padding: 5px; min-width: 300px;"
      disabled={requestInProcess}
    />
    <button
      disabled={requestInProcess}
      on:click={() => (domainsToAdd = domainsToAdd.filter((d, _i) => i !== _i))}
      style="background-color: #666; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;"
    >
      -
    </button>
  </div>
{/each}

<div style="margin-top: 15px; display: flex; gap: 10px;">
  <button
    disabled={requestInProcess}
    on:click={() => {
      domainsToAdd = [...domainsToAdd, ""];
    }}
    style="background-color: #0066cc; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 3px;"
  >
    + Add Domain Field
  </button>
  <button
    disabled={requestInProcess}
    on:click={saveDomains}
    style="background-color: #00aa00; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 3px; font-weight: bold;"
  >
    Save All Domains
  </button>
</div>

<h2 style="margin-top: 30px;">Update Router Configuration</h2>
<button
  disabled={requestInProcess}
  on:click={scanUpdate}
  style="background-color: #ff6600; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 3px; font-weight: bold;"
>
  {requestInProcess ? "Processing..." : "Scan & Update Router"}
</button>

{#if outputLog.length > 0}
  <h3 style="margin-top: 20px;">Output Log:</h3>
  <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">{#each outputLog as row}{row}
{/each}</pre>
{/if}
