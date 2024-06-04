import { fullDell, fullInstall, lagIp, showConfig } from "$lib/server/adapter";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import mergeDeep from "merge-deep";

export const GET: RequestHandler = async ({ url, fetch }) => {
  const mode = url.searchParams.get("mode");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;
  let debug: any;

  try {
    switch (mode) {
      case "showConfig":
        const conf = await showConfig();
        const entriesReq = await fetch("/api/entries");
        const {data: entries} = await entriesReq.json();

        const matches = conf?.config["advanced-queue"]?.filters?.match;
        const leafQueueMap = conf?.config["advanced-queue"]?.leaf?.queue;
                        
        const records: any = {};
        const matchesKeys = Object.keys(matches || {});

        for (let i = 0; i < matchesKeys.length; i++) {
          const key = matchesKeys[i];
          const match = matches[key];
          const sourceIp = match.ip?.source?.address?.split("/")[0];
          const destIp = match.ip?.destination?.address?.split("/")[0];
          const leafQueue = leafQueueMap[match.target];
          if (sourceIp && !records[sourceIp]) {
            records[sourceIp] = { ip: sourceIp };
          }
          if (destIp && !records[destIp]) {
            records[destIp] = { ip: destIp };
          }
          if (sourceIp) {
            records[sourceIp].downSpeed = +leafQueue.bandwidth.split("kbit")[0];
            records[sourceIp].downQueueId = +match.target;
          }
          if (destIp) {
            records[destIp].upSpeed = +leafQueue.bandwidth.split("kbit")[0];
            records[destIp].upQueueId = +match.target;
          }
        }
        outData = conf.outData;
        errData = conf.errData;
        exitCode = conf.exitCode;
        data = mergeDeep([], entries.map(({name, id} : any) => ({name, id}) ), Object.values(records || {}) );
        debug = { matches, leafQueueMap, records, conf };
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
        break;

      case "fullDell":
        const del = await fullDell();
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
      outData = fi.outData;
      errData = fi.errData;
      exitCode = fi.exitCode;
      break;
    default:
      return json({ error: "Unknown mode" }, { status: 400 });
  }

  return json({ mode, outData, errData, exitCode, data: body});
};
