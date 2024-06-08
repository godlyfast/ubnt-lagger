import mergeDeep from "merge-deep";
import { batchCreateEntries, deleteAllEntries, getEntries } from "./database";
import { execute } from "./adapter";
import { parseConfig } from "./helpers";

export const showConfigWithEntriesPopulated = async () => {
  const conf = await showConfig();
  const entries = await getEntries();

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
  const outData = conf.outData;
  const errData = conf.errData;
  const exitCode = conf.exitCode;
  const data = mergeDeep(
    [],
    entries.map(({ name, id, ip }: any) => ({ name, id, ip })),
    Object.values(records || {})
  );
  const debug = { matches, leafQueueMap, records, conf };
  return { outData, errData, exitCode, data, debug };
};

export async function showConfig() {
  let { outData, errData, exitCode } = await execute(["showConfig"]);

  return {
    outData,
    errData,
    exitCode,
    config: parseConfig(outData, "traffic-control"),
  };
}

export async function fullInstall(
  set: { ip: string; upSpeed: number; downSpeed: number }[]
) {
  const args = [
    "fullInstall",
    ...set.map(
      ({ ip, upSpeed, downSpeed }) =>
        `${ip} ${upSpeed.toString()} ${downSpeed.toString()}`
    ),
  ];
  const { outData, errData, exitCode } = await execute(args);
  return {
    outData,
    errData,
    exitCode,
  };
}

export async function lagIp({
  upQueueId,
  upSpeed,
  downSpeed,
  downQueueId,
  oldDownSpeed,
  oldUpSpeed,
}: {
  upQueueId: number;
  upSpeed: number;
  downSpeed: number;
  downQueueId: number;
  oldDownSpeed: number;
  oldUpSpeed: number;
}) {
  const { outData, errData, exitCode } = await execute([
    "lagIp",
    upQueueId.toString(),
    oldUpSpeed.toString(),
    upSpeed.toString(),
    downQueueId.toString(),
    oldDownSpeed.toString(),
    downSpeed.toString(),
  ]);

  return {
    outData,
    errData,
    exitCode,
  };
}

export async function fullDell() {
  const { outData, errData, exitCode } = await execute(["fullDell"]);

  return {
    outData,
    errData,
    exitCode,
  };
}

export const synchronizeEntries = async () => {
  const existingEntries = await getEntries();
  const { data } = await showConfigWithEntriesPopulated();
  const newEntries = mergeDeep([], existingEntries, data);
  await deleteAllEntries();
  const e = await batchCreateEntries(
    newEntries.map(({ ip, downSpeed, upSpeed, name }, i) => ({
      id: i,
      ip,
      downSpeed,
      upSpeed,
      name,
    }))
  );
};
