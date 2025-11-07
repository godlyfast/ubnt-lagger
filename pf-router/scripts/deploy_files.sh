source scripts/utils/load_env.sh

read_env

sshpass -p $UBNT_PASS scp artifacts/userpass.txt $UBNT_USER@$UBNT_IP:/config/auth/userpass.txt
sshpass -p $UBNT_PASS scp artifacts/US-NY-ovpn-udp.ovpn $UBNT_USER@$UBNT_IP:/config/auth/US-NY-ovpn-udp.ovpn
sshpass -p $UBNT_PASS scp artifacts/PL-ovpn-udp.ovpn $UBNT_USER@$UBNT_IP:/config/auth/PL-ovpn-udp.ovpn
sshpass -p $UBNT_PASS scp scripts/remote/connect-vpn.sh $UBNT_USER@$UBNT_IP:/config/scripts/connect-vpn.sh
sshpass -p $UBNT_PASS scp scripts/remote/drop-vpn.sh $UBNT_USER@$UBNT_IP:/config/scripts/drop-vpn.sh
sshpass -p $UBNT_PASS scp scripts/remote/add_group.sh $UBNT_USER@$UBNT_IP:/config/scripts/add_group.sh
sshpass -p $UBNT_PASS scp scripts/remote/set_rules.sh $UBNT_USER@$UBNT_IP:/config/scripts/set_rules.sh


### RESET!!!

sshpass -p $UBNT_PASS scp artifacts/config/config.boot $UBNT_USER@$UBNT_IP:/config/auth/config.boot
sshpass -p $UBNT_PASS scp artifacts/config/dhcpd.leases $UBNT_USER@$UBNT_IP:/config/auth/dhcpd.leases
sshpass -p $UBNT_PASS scp artifacts/config/dnsmasq-dhcp.leases  $UBNT_USER@$UBNT_IP:/config/auth/dnsmasq-dhcp.leases