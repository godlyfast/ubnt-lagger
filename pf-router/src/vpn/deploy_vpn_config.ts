import { run } from "../common/run";
import "dotenv/config";


const FIREWALL_GROUP = process.env.DEST_VPN_REQUIRED;
const VPN_USERS = process.env.SRC_VPN_REQUIRED;
const LB_GROUP = process.env.LB_GROUP;

if (!FIREWALL_GROUP) {
    throw new Error("FIREWALL_GROUP is not defined");
}

if (!VPN_USERS) {
    throw new Error("VPN_USERS is not defined");
}

if (!LB_GROUP) {
    throw new Error("LB_GROUP is not defined");
}

const conf = () => `
sudo chmod +x /config/scripts/connect-vpn.sh

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete system task-scheduler task vpn

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system task-scheduler task vpn executable path /config/scripts/connect-vpn.sh
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system task-scheduler task vpn executable arguments 5
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set system task-scheduler task vpn crontab-spec "* * * * *"

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5020
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5030
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5040
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5050
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5060
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete service nat rule 5070

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5020 description "masquerade for vtun0"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5020 outbound-interface vtun0
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5020 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5030 description "masquerade for vtun1"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5030 outbound-interface vtun1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5030 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5040 description "masquerade for vtun2"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5040 outbound-interface vtun2
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5040 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5050 description "masquerade for vtun3"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5050 outbound-interface vtun3
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5050 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5060 description "masquerade for vtun4"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5060 outbound-interface vtun4
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5060 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5070 description "masquerade for vtun5"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5070 outbound-interface vtun5
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set service nat rule 5070 type masquerade

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete load-balance group V

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun0
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun2
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun3
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun4
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} interface vtun5
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} sticky dest-addr enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} sticky dest-port enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} sticky proto enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} sticky source-addr enable
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set load-balance group ${LB_GROUP} sticky source-port enable

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group network-group PRIVATE_NETS network 192.168.0.0/16
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group network-group PRIVATE_NETS network 172.16.0.0/12
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group network-group PRIVATE_NETS network 10.0.0.0/8
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group network-group PRIVATE_NETS description "Private Networks"

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group ${FIREWALL_GROUP}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group ${FIREWALL_GROUP} description "VPN REQUIRED IPs"

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group ${VPN_USERS}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group ${VPN_USERS} description "VPN USERS IPs"

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete firewall modify balance
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 10 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 10 destination group network-group PRIVATE_NETS
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 10 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 20 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 20 destination group address-group ADDRv4_vtun0
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 20 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 30 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 30 destination group address-group ADDRv4_vtun1
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 30 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 40 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 40 destination group address-group ADDRv4_vtun2
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 40 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 50 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 50 destination group address-group ADDRv4_vtun3
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 50 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 60 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 60 destination group address-group ADDRv4_vtun4
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 60 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 70 action modify
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 70 destination group address-group ADDRv4_vtun5
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 70 modify table main

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 140 modify lb-group ${LB_GROUP}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 140 destination group address-group ${FIREWALL_GROUP}

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 150 modify lb-group ${LB_GROUP}
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 150 source group address-group ${VPN_USERS}

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set interfaces ethernet eth1 firewall in modify balance

/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end
`;


(async () => {
    const {stderr, stdout} = await run(conf());
    console.log(stdout, stderr);
})();
