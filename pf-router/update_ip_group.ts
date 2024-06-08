import { readFileSync } from "fs";
import { run } from "./run";

const cmd = (GROUP_NAME: string, ipsToAdd: string[]) => `sudo /config/scripts/add_group.sh ${GROUP_NAME} ${ipsToAdd.join(" ")}`;

(async () => {
  try {
    const { stdout, stderr } = await run(`
        /opt/vyatta/bin/vyatta-op-cmd-wrapper show configuration
    `);
    if (stderr) {
      throw new Error(stderr);
    }
    if (!stdout) {
      throw new Error("No output");
    }
    const nameToIpsMapScanned: Record<string, string[]> = JSON.parse(
      readFileSync("ips.json").toString()
    );

    const names = Object.keys(nameToIpsMapScanned);

    const commands: string[] = [];
    names.forEach(async (name) => {
      let ipsInConfig: string[] = [];
      const [, matches] = stdout.split(`address-group ${name} {`);
      if (matches) {
        const [ipsStr] = matches.split("}");
        ipsInConfig = ipsStr
          .split(" ")
          .map((ip) => ip.trim())
          .filter((ip) => ip !== "" && ip !== "undefined" && ip !== "address");
      }

      // console.log(ips, ipsScanned);
      const ipsToAdd: string[] = [];
      const ipsScanned = nameToIpsMapScanned[name];
      ipsScanned.forEach((ip: string) => {
        if (!ipsInConfig.includes(ip)) {
          // console.log("Adding IP", ip);
          ipsToAdd.push(ip);
        }
      });
      if (ipsToAdd.length === 0) {
        console.log(name, ": No IPs to add");
        return;
      }
      commands.push(cmd(name, ipsToAdd));
      console.log(name, ": IPs to add", ipsToAdd);
    });
    const { stdout: addOut, stderr: addErr } = await run(`${commands.join(" && ")}`);
    console.log(addOut, addErr);
  } catch (error) {
    console.error(error);
  }
})();
