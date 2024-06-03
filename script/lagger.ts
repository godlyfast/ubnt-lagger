import SSH from "simple-ssh";
import "dotenv/config";

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

const fullDellCmd = `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete traffic-control
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;
const fullInstallCmd = (
  set: { IP: string; UP_SPEED: number; DOWN_SPEED: number }[]
) => `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete traffic-control

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 bandwidth 1000mbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 attach-to global
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 description UBNT-BQ

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue queue-type fq-codel UBNT_BQ_FQ_CODEL


${set
  .map(({ IP, UP_SPEED, DOWN_SPEED }, i) => {
    const c = i + 10 * (i + 1);
    return `
# ${IP}, ${UP_SPEED}, ${DOWN_SPEED} 

# src -> dst
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${c} parent 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${c} bandwidth ${DOWN_SPEED}kbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${c} queue-type UBNT_BQ_FQ_CODEL

# dst -> src

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${
      c + 1
    } parent 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${
      c + 1
    } bandwidth ${UP_SPEED}kbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${
      c + 1
    } queue-type UBNT_BQ_FQ_CODEL

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${c} attach-to 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${c} target ${c}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${c} ip source address ${IP}/32

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${
      c + 1
    } attach-to 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${
      c + 1
    } target ${c + 1}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match ${
      c + 1
    } ip destination address ${IP}/32
`;
  })
  .join("\n")}

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;

const lagIpCmd = (
  UP_QUEUE_ID: number,
  OLD_UP_SPEED: number,
  UP_SPEED: number,
  DOWN_QUEUE_ID: number,
  OLD_DOWN_SPEED: number,
  DOWN_SPEED: number
) => `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete traffic-control advanced-queue leaf queue ${UP_QUEUE_ID} bandwidth ${OLD_UP_SPEED}kbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete traffic-control advanced-queue leaf queue ${DOWN_QUEUE_ID} bandwidth ${OLD_DOWN_SPEED}kbit

# src -> dst

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${DOWN_QUEUE_ID} bandwidth ${DOWN_SPEED}kbit

# dst -> src

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue ${UP_QUEUE_ID} bandwidth ${UP_SPEED}kbit

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;

const showConfigCmd = `
/opt/vyatta/bin/vyatta-op-cmd-wrapper show configuration
`;

export function fullDell() {
  return ssh
    .exec("bash", {
      args: ["-c", fullDellCmd],
      out: function (stdout) {
        console.log(stdout);
      },
    })
    .start();
}

export async function fullInstall(
  set: { ip: string; upSpeed: number; downSpeed: number }[]
) {
  const cmd = fullInstallCmd(
    set.map(({ ip, upSpeed, downSpeed }) => ({
      IP: ip,
      UP_SPEED: upSpeed,
      DOWN_SPEED: downSpeed,
    }))
  );
  return ssh
    .exec("bash", {
      args: ["-c", cmd],
      out: function (stdout) {
        console.log(stdout);
      },
    })
    .start();
}

export function lagIp({
  upQueueNumber,
  downQueueNumber,
  upSpeed,
  downSpeed,
  oldDownSpeed,
  oldUpSpeed,
}: {
  upQueueNumber: number;
  downQueueNumber: number;
  upSpeed: number;
  downSpeed: number;
  oldUpSpeed: number;
  oldDownSpeed: number;
}) {
  const cmd = lagIpCmd(upQueueNumber, oldUpSpeed, upSpeed, downQueueNumber, oldDownSpeed, downSpeed);
  console.log(cmd);
  return ssh
    .exec("bash", {
      args: [
        "-c",
        cmd,
      ],
      out: function (stdout) {
        console.log(stdout);
      },
    })
    .start();
}

const mode = process.argv[2];

(async function () {
  console.log("mode:", mode);
  switch (mode) {
    case "fullDell":
      fullDell();
      break;
    case "lagIp":
      const upQueueNumber = +process.argv[3];
      const oldUpSpeed = +process.argv[4];
      const upSpeed = +process.argv[5];
      const downQueueNumber = +process.argv[6];
      const oldDownSpeed = +process.argv[7];
      const downSpeed = +process.argv[8];
      lagIp({ upQueueNumber, downQueueNumber, upSpeed, downSpeed, oldDownSpeed, oldUpSpeed });
      break;
    case "fullInstall":
      const set = [];
      for (let i = 3; i < process.argv.length; i += 3) {
        const ip = process.argv[i];
        const upSpeed = +process.argv[i + 1];
        const downSpeed = +process.argv[i + 2];
        set.push({ ip, upSpeed, downSpeed });
      }
      fullInstall(set);
      break;
    case "showConfig":
      ssh
        .exec("bash", {
          args: ["-c", showConfigCmd],
          out: function (stdout) {
            console.log(stdout);
          },
        })
        .start();
      break;
    default:
      console.log("Error: Unknown mode");
  }
})();
