#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
echo $ENV_LOCATION
source $ENV_LOCATION

ssh root@"$STORAGE_TORONTO_IP" 'bash -s' < token-command.sh
ssh root@"$STORAGE_AMSTERDAM_IP" 'bash -s' < token-command.sh
ssh root@"$STORAGE_BANGALORE_IP" 'bash -s' < token-command.sh
ssh root@"$STORAGE_SINGAPORE_IP" 'bash -s' < token-command.sh
