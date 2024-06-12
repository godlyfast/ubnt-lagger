import SSH from "simple-ssh";
import "dotenv/config";

export const run = (cmd: string) =>
  new Promise<{ stdout?: string; stderr?: string; code: number }>((resolve) => {
    let stderr = "",
      stdout = "";
    if (!process.env.UBNT_IP) {
      throw new Error("UBNT_IP is not defined");
    }
    if (!process.env.UBNT_USER) {
      throw new Error("UBNT_USER is not defined");
    }
    if (!process.env.UBNT_PASS) {
      throw new Error("UBNT_PASS is not defined");
    }
    const ssh = new SSH({
      host: process.env.UBNT_IP,
      user: process.env.UBNT_USER,
      pass: process.env.UBNT_PASS,
    });

    ssh
      .exec("sudo bash -c", {
        args: [`"${cmd.replaceAll('"', '\\"')}"`],
        out: function (chunk) {
          // resolve({ stdout });
          stdout += chunk;
        },
        err: function (chunk) {
          // resolve({ stderr });
          stderr += chunk;
        },
        exit: function (code) {
          ssh.reset();
          resolve({ stdout, stderr, code });
        },
      })
      .start();
  });
