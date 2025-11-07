#!/bin/vbash

source /opt/vyatta/etc/functions/script-template

configure

echo "DROPPING ALL TUNNELS"

delete interfaces openvpn

commit
save