import { PrismaClient } from "@prisma/client";
import isValidDomain from "is-valid-domain";
import { run } from "./run";

const LB_GROUP = process.env.LB_GROUP;

if (!LB_GROUP) {
  throw new Error("LB_GROUP is not defined");
}

const prisma = new PrismaClient();

const action = process.argv[2];
const domains = process.argv.slice(3).filter((domain) => isValidDomain(domain));

const removeFirewallRuleCmd = (ruleN: number) => `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete firewall modify balance rule ${ruleN}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save
`;

// name is domain name
const removeAddressGroupCmd = (name: string) =>
  `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete firewall group address-group ${name}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save
`;

async function addDomains(domains: string[]) {
  console.log("Domains to add:", domains);
  const r = await prisma.domainName.createMany({
    data: domains.map((domain) => ({ name: domain })),
  });
  console.log(`Created ${r.count} domains`);
}

async function removeDomains(domains: string[]) {
  console.log("Domains to remove:", domains);
  const { stdout: co, stderr: ce } = await run(
    `/opt/vyatta/bin/vyatta-op-cmd-wrapper show configuration`
  );
  if (ce) {
    throw new Error(ce);
  }
  if (!co) {
    throw new Error("No output");
  }
  // console.log("Config output:", co);
  await Promise.all(
    domains.map(async (domain) => {
      let re = new RegExp(
        String.raw`rule([0-9]*){destination{group{address-group${domain}}}modify{lb-group${LB_GROUP}}}`,
        "g"
      );
      const sanitized = co.replaceAll(" ", "").replaceAll("\n", "");
      const [matches] = sanitized.matchAll(re);
      if (matches) {
        const [text, ruleNumber] = matches;
        console.log("Found rule", ruleNumber);
        const { stdout: delOut, stderr: delErr } = await run(
          removeFirewallRuleCmd(Number(ruleNumber))
        );
        if (delErr) {
          throw new Error(delErr);
        }
        console.log(delOut);
        console.log("Deleted rule", ruleNumber);
      }
      const { stdout: delOut2, stderr: delErr2 } = await run(
        removeAddressGroupCmd(domain)
      );
      if (delErr2) {
        throw new Error(delErr2);
      }
      console.log(delOut2);
      console.log("Deleted address-group", domain);
      try {
        const rr = await prisma.domainName.delete({
          where: { name: domain },
          include: { ipRecords: true },
        });
        await prisma.ipRecord.deleteMany({
          where: { id: { in: rr.ipRecords.map((ip) => ip.id) } },
        });
      } catch (error) {
        // console.error(error);
      }

      console.log(`Deleted ${domain} domain and its IPs`);
    })
  );

  // const r = await prisma.domainName.deleteMany({
  //   where: { name: { in: domains } },
  // });
  // console.log(`Deleted ${r.count} domains`);
}

(async () => {
  console.log("Action:", action);
  console.log("Domains:", domains);
  switch (action) {
    case "add":
      await addDomains(domains);
      break;
    case "remove":
      await removeDomains(domains);
      break;
    default:
      console.log("Unknown action:", action);
  }
})();
