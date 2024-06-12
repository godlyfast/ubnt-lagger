import { run } from "./common/run";
import "dotenv/config";


const cmd = () => `

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward auto-firewall enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward hairpin-nat enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward wan-interface eth0
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward lan-interface eth1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward lan-interface eth2


/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 1 description ROON
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 1 forward-to address 192.168.55.143
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 1 forward-to port 55000
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 1 original-port 55000
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 1 protocol tcp_udp

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 2 description TORRENT
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 2 forward-to address 192.168.55.112
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 2 forward-to port 51414
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 2 original-port 51414
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set port-forward rule 2 protocol tcp_udp

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;

(async () => {
  const { stderr, stdout } = await run(cmd());
  console.log(stdout, stderr);
})();