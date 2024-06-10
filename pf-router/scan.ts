import dns from "node:dns";
import ipaddr from "ipaddr.js";

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const { DEST_VPN_REQUIRED } = process.env;

if (!DEST_VPN_REQUIRED) {
  throw new Error("DEST_VPN_REQUIRED is not defined");
}

const prisma = new PrismaClient();

async function getIps(names: string[]): Promise<Record<string, string[]>> {
  const ips: Record<string, string[]> = {};

  await Promise.all(
    names
      .filter((n) => n !== DEST_VPN_REQUIRED)
      .map((name) => {
        return new Promise<void>((resolve, reject) => {
          dns.lookup(
            name,
            {
              family: 0,
              hints: dns.ADDRCONFIG | dns.V4MAPPED,
              all: true,
            },
            (err, addresses) => {
              console.log(name, addresses);
              if (err) {
                console.log("Error:", err);
                return reject(err);
              }
              ips[name] = [];

              if (typeof addresses === "string") {
                console.log("Addresses:", addresses);
                // const ip  = addresses;
                const ip = ipaddr.process(addresses);
                if (ip && ip.kind() === "ipv4")
                  ips[name].push(ip.toNormalizedString());
                return resolve();
              }
              addresses.forEach(({ address, family }) => {
                // console.log("Address:", address, "Family:", family);
                const ip = ipaddr.process(address);
                // console.log("IP:", ip);
                if (ip && ip.kind() === "ipv4") {
                  ips[name].push(ip.toNormalizedString());
                }
              });
              return resolve();
            }
          );
        });
      })
  );

  return ips;
}

process.argv[2] === "ips" &&
  (async () => {
    const dns = await prisma.domainName.findMany({
      include: { ipRecords: true },
    });
    const names: string[] = dns.map((dn) => dn.name);
    const ips = await getIps(names);

    const orphans = await prisma.ipRecord.findMany({
      where: {
        domainNames: {
          none: {},
        },
      },
    });

    if (orphans.length > 0) {
      await prisma.domainName.upsert({
        where: {
          name: DEST_VPN_REQUIRED,
        },
        update: {
          ipRecords: {
            connect: orphans.map((orphan) => ({ id: orphan.id })),
          },
        },
        create: {
          name: DEST_VPN_REQUIRED,
          ipRecords: {
            connect: orphans.map((orphan) => ({ id: orphan.id })),
          },
        },
      });
    }

    const storedIps: Record<string, string[]> = dns.reduce<
      Record<string, string[]>
    >((acc, val) => {
      acc[val.name] = val.ipRecords.map((ip) => ip.ip);
      return acc;
    }, {});

    const ipsToSave: {
      ip: string;
      name: string;
      domainNameIds: string[] | undefined;
    }[] = [];

    Object.keys(ips).forEach((name) => {
      ips[name].forEach((ip) => {
        if (!storedIps[name].includes(ip)) {
          console.log("New IP:", ip, "for", name);
          ipsToSave.push({
            ip,
            name,
            domainNameIds: dns
              .filter((dn) => dn.name === name)
              .map((dn) => dn.id),
          });
        }
      });
    });

    await Promise.all(
      ipsToSave.map((ip) => {
        return prisma.ipRecord.create({
          data: {
            ip: ip.ip,
            domainNames: ip.domainNameIds
              ? {
                  connect: ip.domainNameIds.map((id) => ({ id })),
                }
              : undefined,
          },
        });
      })
    );
  })();
