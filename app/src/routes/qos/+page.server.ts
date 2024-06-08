import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const r = await fetch(`/api/lagger?mode=showConfig`);
  return { entries: (await r.json()).data};
};
