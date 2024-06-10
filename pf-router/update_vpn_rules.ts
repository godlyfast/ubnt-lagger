import { run } from "./run";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LB_GROUP = process.env.LB_GROUP;

if (!LB_GROUP) {
  throw new Error("LB_GROUP is not defined");
}

const cmd = (names: string[], lastRuleNumber: number = 151) =>
  names
    .map(
      (name, i) => `/config/scripts/set_rules.sh ${lastRuleNumber + i} ${name} V`
    )
    .join(" && ");

(async () => {
  const nameToIpsMapScanned: Record<string, string[]> = (
    await prisma.domainName.findMany({ include: { ipRecords: true } })
  ).reduce<Record<string, string[]>>((acc, val) => {
    acc[val.name] = val.ipRecords.map((ip) => ip.ip);
    return acc;
  }, {});

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
    if (co.indexOf(`address-group ${name}`) > -1) {
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
        existingNames.push({ ruleNumber, name });
      } else {
        console.log("Will add address-group for", name);
        namesToCreate.push(name);
      }
    } else {
      console.log("Will add address-group for", name);
      namesToCreate.push(name);
    }
  });

  if (namesToCreate.length === 0) {
    console.log("No new address-groups to add");
    return;
  }

  const latestRuleNumber = existingNames.length > 0 ? Math.max(
    ...existingNames.map(({ ruleNumber }) => parseInt(ruleNumber))
  ): 150;


  const cmdStr = cmd(namesToCreate, latestRuleNumber + 1);

  console.log("Will run command:", cmdStr);

  const { stderr, stdout } = await run(cmdStr);
  console.log(stdout, stderr);
})();
