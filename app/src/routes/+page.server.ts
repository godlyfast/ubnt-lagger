import mergeDeep from 'merge-deep';
import * as db from "$lib/server/database";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const r = await fetch(`/api/lagger?mode=showConfig`);
  const { data } = await r.json();
  const entries = await db.getEntries();
  return { entries: mergeDeep([], data, entries) };
};
