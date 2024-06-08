import { ChildProcess, exec } from "node:child_process";
import { PF_ROUTER_PATH } from "$env/static/private";

export async function execute(args: string[]) {
  let outData: string = '';
  let errData: string = '';
  let exitCode: number | null = null;
  await new Promise((resolve) => {
    const cp: ChildProcess = exec(
      `cd ${PF_ROUTER_PATH} && npm run qos ${args.join(" ")}`
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
    // cp.on("exit", (code) => {
    //   exitCode = code;
    //   resolve(null);
    // });
  });
  return {
    outData,
    errData,
    exitCode,
  };
}