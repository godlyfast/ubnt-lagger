import { run } from "./run";

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
    // 0 -> 1, 2
    // 1 -> 3, 4
    // 2 -> 5, 6
    // 3 -> 7, 8
    // 4 -> 9, 10
    // 5 -> 11, 12
    const arr = [];
    let j = 1;
    while (arr.length < i + 1) {
      if (j % 2 !== 0) arr.push(j);
      j += 1;
    }
    const c = arr[i];
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
  return run(fullDellCmd);
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
  return run(cmd);
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
  const cmd = lagIpCmd(
    upQueueNumber,
    oldUpSpeed,
    upSpeed,
    downQueueNumber,
    oldDownSpeed,
    downSpeed
  );
  return run(cmd);
}

const mode = process.argv[2];

(async function () {
  console.log("mode:", mode);
  switch (mode) {
    case "fullDell":
      const {stdout: fdo, stderr: fde} = await fullDell();
      console.log(fdo, fde);
      break;
    case "lagIp":
      const upQueueNumber = +process.argv[3];
      const oldUpSpeed = +process.argv[4];
      const upSpeed = +process.argv[5];
      const downQueueNumber = +process.argv[6];
      const oldDownSpeed = +process.argv[7];
      const downSpeed = +process.argv[8];
      const {stdout: lo, stderr: le} = await lagIp({
        upQueueNumber,
        downQueueNumber,
        upSpeed,
        downSpeed,
        oldDownSpeed,
        oldUpSpeed,
      });
      console.log(lo, le);
      break;
    case "fullInstall":
      const set = [];
      for (let i = 3; i < process.argv.length; i += 3) {
        const ip = process.argv[i];
        const upSpeed = +process.argv[i + 1];
        const downSpeed = +process.argv[i + 2];
        set.push({ ip, upSpeed, downSpeed });
      }
      const {stdout: fio, stderr: fie} = await fullInstall(set);
      console.log(fio, fie);
      break;
    case "showConfig":
      const {stdout, stderr} = await run(showConfigCmd);
      console.log(stdout, stderr);
      break;
    default:
      console.log("Error: Unknown mode");
  }
})();
