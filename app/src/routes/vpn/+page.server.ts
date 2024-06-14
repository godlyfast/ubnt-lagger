import { getDomains } from "$lib/client/vpn";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { entries } = await getDomains(fetch);
  return { domains: entries };
};
