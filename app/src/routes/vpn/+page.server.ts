import { getDomains } from "$lib/client/vpn";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const { entries } = await getDomains(fetch);
    return { domains: entries || [] };
  } catch (error) {
    console.error("Failed to load domains:", error);
    return { domains: [], error: "Failed to connect to database" };
  }
};
