import { IpRecord, Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const existingInDBDomains = await tx.domainName.findMany({
      include: { ipRecords: true },
    });
    const existingInDBIps = await tx.ipRecord.findMany();
    const domainNamesJson: string[] = JSON.parse(
      readFileSync("names.json", "utf-8")
    ).filter(
      (name: string) =>
        !existingInDBDomains.some((domain) => domain.name === name)
    );
    const ipsJson: Record<string, string[]> = JSON.parse(
      readFileSync("ips.json", "utf-8")
    );

    if (domainNamesJson.length === 0) {
      console.log("No new domain names to add");
    }

    const uniqIpsInJson = Object.values(ipsJson)
      .reduce((acc, val) => {
        val.forEach((v) => {
          if (!acc.includes(v)) {
            acc.push(v);
          }
        });
        return acc;
      })
      .filter((ip) => !existingInDBIps.some((ipRecord) => ipRecord.ip === ip));
    let ipRecords: IpRecord[] = [];
    if (uniqIpsInJson.length === 0) {
      console.log("No new ips to add");
    } else {
      ipRecords = await tx.ipRecord.createManyAndReturn({
        data: uniqIpsInJson.map((ip) => ({
          ip,
        })),
      });
    }

    await Promise.all(
      domainNamesJson.map((name) => {
        return tx.domainName.create({
          data: {
            name,
            ipRecords: {
              connect: ipRecords
                .filter((ipRecord) => ipsJson[name].includes(ipRecord.ip))
                .map((ipRecord) => ({
                  id: ipRecord.id,
                })),
            },
          },
        });
      })
    );
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
