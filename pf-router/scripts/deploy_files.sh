read_env() {
  local filePath="${1:-.env}"

  if [ ! -f "$filePath" ]; then
    echo "missing ${filePath}"
    exit 1
  fi

  echo "Reading $filePath"
  while read -r LINE; do
    # Remove leading and trailing whitespaces, and carriage return
    CLEANED_LINE=$(echo "$LINE" | awk '{$1=$1};1' | tr -d '\r')

    if [[ $CLEANED_LINE != '#'* ]] && [[ $CLEANED_LINE == *'='* ]]; then
      export "$CLEANED_LINE"
    fi
  done < "$filePath"
}

read_env

sshpass -p $UBNT_PASS scp artifacts/userpass.txt $UBNT_USER@$UBNT_IP:/config/auth/userpass.txt
sshpass -p $UBNT_PASS scp artifacts/US-NY-ovpn-udp.ovpn $UBNT_USER@$UBNT_IP:/config/auth/US-NY-ovpn-udp.ovpn
sshpass -p $UBNT_PASS scp scripts/remote/connect-vpn.sh $UBNT_USER@$UBNT_IP:/config/scripts/connect-vpn.sh
sshpass -p $UBNT_PASS scp scripts/remote/add_group.sh $UBNT_USER@$UBNT_IP:/config/scripts/add_group.sh
sshpass -p $UBNT_PASS scp scripts/remote/set_rules.sh $UBNT_USER@$UBNT_IP:/config/scripts/set_rules.sh
