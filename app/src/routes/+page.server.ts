// import * as db from "$lib/server/database";
import type { PageServerLoad } from "./$types";

import { showConfig } from "$lib/server/adapter";

export const load: PageServerLoad = async ({ params }) => {
  return await showConfig();
};
