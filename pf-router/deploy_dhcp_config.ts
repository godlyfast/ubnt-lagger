import { run } from "./run";
import "dotenv/config";


const cmd = () => `

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server disabled false

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN1 authoritative enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN1 subnet 192.168.55.0/24 default-router 192.168.55.1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN1 subnet 192.168.55.0/24 dns-server 192.168.55.2
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN1 subnet 192.168.55.0/24 lease 86400
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN1 subnet 192.168.55.0/24 start 192.168.55.38 stop 192.168.55.243

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN2 authoritative enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN2 subnet 192.168.56.0/24 default-router 192.168.56.1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN2 subnet 192.168.56.0/24 dns-server 192.168.55.1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN2 subnet 192.168.56.0/24 lease 86400
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service dhcp-server shared-network-name LAN2 subnet 192.168.56.0/24 start 192.168.56.38 stop 192.168.56.243


/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;

(async () => {
  const { stderr, stdout } = await run(cmd());
  console.log(stdout, stderr);
})();