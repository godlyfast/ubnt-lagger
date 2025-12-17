#!/bin/vbash

START=0
END=$(($1))
TOADD=0

if [ "$END" == '' ]; then END=1; fi

echo Starting $MAX conns

source /opt/vyatta/etc/functions/script-template

configure

for ((i = $START; i <= $END; i++)); do

  echo "Checking tunnel $i"

  if [ "$(show interfaces | grep vtun$i)" != '' ]; then
    echo "Tunnel $i is online"
    continue
  fi

  set interfaces openvpn vtun$i config-file /config/auth/NL-ovpn-tcp.ovpn
  set interfaces openvpn vtun$i description 'PUREVPN NL TCP Tunnel'
  TOADD=$((TOADD + 1))

done

if [ "$TOADD" == 0 ]; then
  echo "No tunnels to add"
  exit
fi

commit
save

