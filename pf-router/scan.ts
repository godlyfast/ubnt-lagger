import mergeDeep from 'merge-deep';
import dns from "node:dns";
import { readFileSync, write, writeFileSync } from "node:fs";
import subquest from "subquest";
import ipaddr from "ipaddr.js";
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
  all: true,
};

async function getIps(names: string[]): Promise<Record<string, string[]>> {
  const ips: Record<string, string[]> = {};

  await Promise.all(
    names.map((name) => {
      return new Promise<void>((resolve, reject) => {
        dns.lookup(name, options, (err, addresses) => {
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
        });
      });
    })
  );

  return ips;
}
function onlyUnique(value: string | Buffer, index: number, array: (string | Buffer)[]) {
  return array.indexOf(value) === index;
}
process.argv[2] === "ips" &&
  (async () => {
    const names: string[] = JSON.parse(
      readFileSync("names.json", "utf-8")
    );

    const ips = await getIps(names);
    const storedIps = JSON.parse(readFileSync("ips.json").toString());
    const merged = mergeDeep({}, ips, storedIps);
    Object.keys(merged).forEach((key) => {
      merged[key] = merged[key].filter(onlyUnique);
    });
    writeFileSync("./ips.json", JSON.stringify(merged));
  })();

// process.argv[2] === "subdomains" &&
//   DNS_NAMES.forEach((name) => {
//     subquest.getSubDomains(
//       {
//         host: "tidal.com",
//         rateLimit: "400", // four requests at time
//         dnsServer: "8.8.8.8", // custom DNS server
//         dictionary: "top_5000", // dictionary file to use
//       },
//       (err, results) => {
//         if (err) {
//           console.log("Error:", err);
//           return;
//         }

//         console.log("Subdomains:", results);
//       }
//     );
//   });

// dns.lookup()
