import { batchCreateEntries, deleteAllEntries } from "$lib/server/database";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, url }) => {
  const body: {
    entries: {
      ip: string;
      downSpeed: number;
      upSpeed: number;
      name: string;
    }[];
  } = await request.json();

  await deleteAllEntries();
  const e = await batchCreateEntries(body.entries.map(({ip, downSpeed, upSpeed, name}) => ({
    ip,
    downSpeed,
    upSpeed,
    name
  })));  

  return json({ data: e });
};
