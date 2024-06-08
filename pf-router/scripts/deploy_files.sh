source scripts/utils/load_env.sh

read_env

sshpass -p $UBNT_PASS scp artifacts/userpass.txt $UBNT_USER@$UBNT_IP:/config/auth/userpass.txt
sshpass -p $UBNT_PASS scp artifacts/US-NY-ovpn-udp.ovpn $UBNT_USER@$UBNT_IP:/config/auth/US-NY-ovpn-udp.ovpn
sshpass -p $UBNT_PASS scp scripts/remote/connect-vpn.sh $UBNT_USER@$UBNT_IP:/config/scripts/connect-vpn.sh
sshpass -p $UBNT_PASS scp scripts/remote/add_group.sh $UBNT_USER@$UBNT_IP:/config/scripts/add_group.sh
sshpass -p $UBNT_PASS scp scripts/remote/set_rules.sh $UBNT_USER@$UBNT_IP:/config/scripts/set_rules.sh
