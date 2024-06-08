import { readFileSync } from "fs";
import { run } from "./run";

const LB_GROUP = process.env.LB_GROUP;

if (!LB_GROUP) {
  throw new Error("LB_GROUP is not defined");
}

const cmd = (names: string[], lastRuleNumber: number = 151) =>
  names
    .map(
      (name, i) => `
        /config/scripts/set_rules.sh ${lastRuleNumber + i} ${name} V
    `
    )
    .join(" && ");

(async () => {
  const nameToIpsMapScanned: Record<string, string[]> = JSON.parse(
    readFileSync("ips.json").toString()
  );

  const names = Object.keys(nameToIpsMapScanned);

  const { stdout: co, stderr: ce } = await run(
    `/opt/vyatta/bin/vyatta-op-cmd-wrapper show configuration`
  );
  if (ce) {
    throw new Error(ce);
  }
  if (!co) {
    throw new Error("No output");
  }

  const namesToCreate: string[] = [];
  const existingNames: { ruleNumber: string; name: string }[] = [];
  names.forEach(async (name) => {
    if (co.includes(`address-group ${name}`)) {
      let re = new RegExp(
        String.raw`rule([1-9]*){destination{group{address-group${name}}}modify{lb-group${LB_GROUP}}}`,
        "g"
      );
      const [matches] = co
        .replaceAll(" ", "")
        .replaceAll("\n", "")
        .matchAll(re);
      if (matches) {
        const [text, ruleNumber] = matches;
        // console.log(name, " Rule ID:", ruleNumber, text);
        existingNames.push({ ruleNumber, name });
      }
    } else {
      console.log("No address-group found for", name);
      // commands.push(cmd([name]));
      namesToCreate.push(name);
    }
  });

  if (namesToCreate.length === 0) {
    console.log("No new address-groups to add");
    return;
  }

  const latestRuleNumber = Math.max( ...existingNames.map(({ ruleNumber }) => parseInt(ruleNumber)) );

  const { stderr, stdout } = await run(
    cmd(namesToCreate, latestRuleNumber + 1)
  );
  console.log(stdout, stderr);
})();
