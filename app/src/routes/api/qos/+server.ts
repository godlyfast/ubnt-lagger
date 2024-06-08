import { fullDell, fullInstall, lagIp, showConfigWithEntriesPopulated, synchronizeEntries } from "$lib/server/qos";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, fetch }) => {
  const mode = url.searchParams.get("mode");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    switch (mode) {
      case "synchronizeEntries":
        const se = await synchronizeEntries();
        break;

      case "showConfig":
        const c = await showConfigWithEntriesPopulated();
        outData = c.outData;
        errData = c.errData;
        exitCode = c.exitCode;
        data = c.data;
        debug = c.debug;
        break;
      case "lagIp":
        const upQueueId = url.searchParams.get("upQueueId");
        const downQueueId = url.searchParams.get("downQueueId");
        const upSpeed = url.searchParams.get("upSpeed");
        const downSpeed = url.searchParams.get("downSpeed");
        const oldDownSpeed = url.searchParams.get("oldDownSpeed");
        const oldUpSpeed = url.searchParams.get("oldUpSpeed");
        if (!upQueueId) {
          throw new Error("upQueueId is required");
        }
        if (!upSpeed) {
          throw new Error("upSpeed is required");
        }
        if (!downQueueId) {
          throw new Error("downQueueId is required");
        }
        if (!downSpeed) {
          throw new Error("downSpeed is required");
        }
        if (!oldDownSpeed) {
          throw new Error("oldDownSpeed is required");
        }
        if (!oldUpSpeed) {
          throw new Error("oldUpSpeed is required");
        }
        const lag = await lagIp({ 
          upQueueId: +upQueueId, 
          upSpeed: +upSpeed, 
          downQueueId: +downQueueId, 
          downSpeed: +downSpeed, 
          oldDownSpeed: +oldDownSpeed, 
          oldUpSpeed: +oldUpSpeed 
        });
        outData = lag.outData;
        errData = lag.errData;
        exitCode = lag.exitCode;
        await synchronizeEntries();
        break;

      case "fullDell":
        const del = await fullDell();
        await synchronizeEntries();
        outData = del.outData;
        errData = del.errData;
        exitCode = del.exitCode;
        break;
      default:
        throw new Error("Unknown mode");
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data, debug });
};

export const POST: RequestHandler = async ({ request, url }) => {
  const body = await request.json();
  const mode = url.searchParams.get("mode");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  switch (mode) {
    case "fullInstall":
      if (!Array.isArray(body)) {
        return json({ error: "Body must be an array" }, { status: 400 });
      }
      const fi = await fullInstall(body);
      await synchronizeEntries();
      outData = fi.outData;
      errData = fi.errData;
      exitCode = fi.exitCode;
      break;
    default:
      return json({ error: "Unknown mode" }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data: body});
};
