import { getEntries } from "$lib/client/qos";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  return getEntries(fetch);
};
