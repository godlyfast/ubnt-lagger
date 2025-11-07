import { getDomains, addDomains, removeDomains } from "$lib/server/vpn";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const mode = url.searchParams.get("mode");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    const rr = await getDomains();
    data = rr;
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data, debug });
};

export const POST: RequestHandler = async ({ url, request }) => {
  const mode = url.searchParams.get("mode");
  const body: { domains: string[] } = await request.json();

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    const rr = await addDomains(body.domains);
    data = rr;
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data, debug });
};

export const DELETE: RequestHandler = async ({ url, request }) => {
  const mode = url.searchParams.get("mode");
  const body: { domains: string[] } = await request.json();

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    const rr = await removeDomains(body.domains);
    data = rr;
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data, debug });
};
