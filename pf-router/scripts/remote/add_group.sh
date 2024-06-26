#!/bin/bash
vop=/opt/vyatta/bin/vyatta-op-cmd-wrapper
vcfg=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper


all_args=("$@")
first_arg="$1"
shift
rest_args=$@

GROUP_NAME=$first_arg

# echo "group $GROUP_NAME"

# Hostnames to look up 
IPS=$rest_args

echo "ADDING $GROUP_NAME"


PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$vcfg begin
# $vcfg delete firewall group address-group $GROUP_NAME
$vcfg set firewall group address-group $GROUP_NAME description "Generated by pf-router for $GROUP_NAME"
for ip in ${IPS[@]}; do
echo "IP will set $ip"
/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper set firewall group address-group $GROUP_NAME address "$ip"  
done
$vcfg commit
$vcfg save
$vcfg end
