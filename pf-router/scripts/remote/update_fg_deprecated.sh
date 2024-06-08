#/bin/bash 
# https://community.ubnt.com/t5/EdgeRouter/Dynamically-updating-an-address-group-with-a-script/m-p/2326881#M206247
run=/opt/vyatta/bin/vyatta-op-cmd-wrapper 
# set -x

all_args=("$@")
first_arg="$1"
shift
rest_args=$@

GROUP_NAME=$first_arg

# echo "group $GROUP_NAME"

# Hostnames to look up 
hostnames=$rest_args


# Static IPs to add to $GROUP_NAME 
static_ips=() 
 
# get current list of addresses in the $GROUP_NAME address group 
trusted_wan=($($run show firewall group $GROUP_NAME | grep -A10000 Members |grep -v Members | awk '{ print $1 }' )) 
 
# resolve trusted hostnames 
resolved_ips_raw=($(getent ahostsv4 ${hostnames[@]} | awk '{ print $1 }')) 
resolved_ips=($(echo "${resolved_ips_raw[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))
 
# add static IPs to resolved IPs 
resolved_ips+=(${static_ips[@]}) 
 
# echo "Hostnames ${hostnames[@]}"
# echo "resolved ${resolved_ips[@]}"
# echo "trusted ${trusted_wan[@]}"

 #if addresses have changed, remove address-group "$GROUP_NAME" and recreate it with the new addresses 
 PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin 
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper begin 
#  /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete firewall group address-group $GROUP_NAME 
#  /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group $GROUP_NAME description "IPs for VPN" 
 for ip in ${resolved_ips[@]}; do
 if [[ ${trusted_wan[@]} =~ $ip ]]
 then
  echo "IP found $ip"
 else
  echo "IP not found $ip"
  /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group $GROUP_NAME address "$ip" 
 fi
 #  echo setting $ip
 done
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper delete firewall modify balance rule 140
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 140 modify lb-group V
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall modify balance rule 140 destination group address-group $GROUP_NAME
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper commit 
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper save 
 /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper end 
