import { ChildProcess, exec } from "node:child_process";
import { PF_ROUTER_PATH } from "$env/static/private";
import { readFileSync } from "node:fs";

export async function execute(args: string[]) {
  let outData: string = '';
  let errData: string = '';
  let exitCode: number | null = null;
  await new Promise((resolve) => {
    const envS = readFileSync(`${PF_ROUTER_PATH}/.env`, "utf-8");
    const env: { [key: string]: string } = {};
    const matches = envS.match(/([#?\s]*\w+)\s*=\s*([\s\S]+?.*)/gm)?.map((m) => m.replace(/\s/g, "")).filter((m) => m[0] !== "#");
    matches?.forEach((m) => {
      const [key, ...values] = m.split("=");
      env[key] = values.join("=");
    });
    const cp: ChildProcess = exec(
      `cd ${PF_ROUTER_PATH} && yarn ${args.join(" ")}  --env-file .env`,
      {
        env: {
          ...process.env,
          ...env, 
        }
      }
    );
    cp.stdout?.on("data", (data) => {
      outData += data;
    });
    cp.stderr?.on("data", (data) => {
      errData += data;
    });
    cp.on("close", (code) => {
      exitCode = code;
      resolve(null);
    });
  });
  return {
    outData,
    errData,
    exitCode,
  };
}

export async function parseJsonResponse(r: string) {
  const [matches] = r.matchAll(/###JSON_RESPONSE_START###(.*)###JSON_RESPONSE_END###/g);
  try {
    return JSON.parse(matches[1]);
  } catch (e: any) {
    console.error("parseJsonResponse error ", e);
    return null
  }
}