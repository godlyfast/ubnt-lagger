import SSH from 'simple-ssh';
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
const fullInstallCmd = (IP: string, UP_SPEED: number, DOWN_SPEED: number) => `
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 bandwidth 1000mbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 attach-to global
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue root queue 1023 description UBNT-BQ

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue queue-type fq-codel UBNT_BQ_FQ_CODEL

# src -> dst

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 1 parent 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 1 bandwidth ${DOWN_SPEED}kbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 1 queue-type UBNT_BQ_FQ_CODEL

# dst -> src

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 2 parent 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 2 bandwidth ${UP_SPEED}kbit
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue leaf queue 2 queue-type UBNT_BQ_FQ_CODEL

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 1 attach-to 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 1 target 1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 1 ip source address ${IP}/32

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 2 attach-to 1023
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 2 target 2
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set traffic-control advanced-queue filters match 2 ip destination address ${IP}/32

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

export function fullInstall({ip, upSpeed, downSpeed}: {ip: string, upSpeed: number, downSpeed: number}) {
  return ssh
    .exec("bash", {
      args: ["-c", fullInstallCmd(ip, upSpeed, downSpeed)],
      out: function (stdout) {
        console.log(stdout);
      },
    })
    .start();
}

const mode = process.argv[2];
const ip = process.argv[3];
const upSpeed = +process.argv[4];
const downSpeed = +process.argv[5];

console.log("mode:", mode);
switch (mode) {
  case "fullDell":
    fullDell();
    break;
  case "fullInstall":
    fullDell();
    fullInstall({ip, upSpeed, downSpeed});
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
    console.log("Unknown mode");
}
