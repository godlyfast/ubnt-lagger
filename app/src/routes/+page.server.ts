// import * as db from "$lib/server/database";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const r = await fetch(`/api/lagger?mode=showConfig`);
  const { data } = await r.json();
  return { entries: data };
};
