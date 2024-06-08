#!/bin/bash
vop=/opt/vyatta/bin/vyatta-op-cmd-wrapper
vcfg=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper


RULE_N="$1"
GROUP_NAME="$2"
LB_GROUP="$3"


echo "ADDING $GROUP_NAME"

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$vcfg begin

$vcfg delete firewall modify balance rule $RULE_N
$vcfg set firewall modify balance rule $RULE_N modify lb-group $LB_GROUP
$vcfg set firewall modify balance rule $RULE_N destination group address-group $GROUP_NAME

$vcfg commit
$vcfg save
$vcfg end
