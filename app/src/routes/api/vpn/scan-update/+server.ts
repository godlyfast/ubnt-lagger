import { scanUpdate } from "$lib/server/vpn";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ url }) => {
  const mode = url.searchParams.get("mode");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    const rr = await scanUpdate();
    data = rr;
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data, debug });
};
