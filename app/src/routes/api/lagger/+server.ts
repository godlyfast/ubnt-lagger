import { fullDell, fullInstall, showConfig } from "$lib/server/adapter";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const mode = url.searchParams.get("mode");
  const ip = url.searchParams.get("ip");
  const upSpeed = url.searchParams.get("upSpeed");
  const downSpeed = url.searchParams.get("downSpeed");

  let outData: any;
  let errData: any;
  let exitCode: number | null = null;

  let data: any;

  try {
    switch (mode) {
      case "showConfig":
        const conf = await showConfig();

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
          }
          if (destIp) {
            records[destIp].upSpeed = +leafQueue.bandwidth.split("kbit")[0];
          }
        }
        outData = conf.outData;
        errData = conf.errData;
        exitCode = conf.exitCode;
        console.log("records", records);
        data = Object.values(records || {});
        break;
      case "lagIp":
        if (!ip) {
          throw new Error("IP is required");
        }
        if (!upSpeed) {
          throw new Error("Up speed is required");
        }
        if (!downSpeed) {
          throw new Error("Down speed is required");
        }
        break;
      case "fullInstall":
        if (!ip) {
          throw new Error("IP is required");
        }
        if (!upSpeed) {
          throw new Error("Up speed is required");
        }
        if (!downSpeed) {
          throw new Error("Down speed is required");
        }
        const r = await fullInstall([{ ip, upSpeed: +upSpeed, downSpeed: +downSpeed }]);
        outData = r.outData;
        errData = r.errData;
        exitCode = r.exitCode;
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

  return json({ mode, ip, outData, errData, exitCode, data });
};
