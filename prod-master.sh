#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
echo $ENV_LOCATION
source $ENV_LOCATION

ssh root@"$STORAGE_TORONTO_IP" 'bash -s' < install-docker.sh
ssh root@"$STORAGE_AMSTERDAM_IP" 'bash -s' < install-docker.sh
ssh root@"$STORAGE_BANGALORE_IP" 'bash -s' < install-docker.sh
ssh root@"$STORAGE_SINGAPORE_IP" 'bash -s' < install-docker.sh
ssh root@"$CENTRAL_NYC_IP" 'bash -s' < install-docker.sh


ssh root@"$STORAGE_TORONTO_IP" 'bash -s' < pull-docker.sh
ssh root@"$STORAGE_AMSTERDAM_IP" 'bash -s' < pull-docker.sh
ssh root@"$STORAGE_BANGALORE_IP" 'bash -s' < pull-docker.sh
ssh root@"$STORAGE_SINGAPORE_IP" 'bash -s' < pull-docker.sh
ssh root@"$CENTRAL_NYC_IP" 'bash -s' < pull-docker.sh

CMD="$(ssh root@$CENTRAL_NYC_IP 'bash -s' < create-network.sh | grep -P 'docker swarm join --token SWMTKN.*' -o)"

ssh root@"$STORAGE_TORONTO_IP" $CMD
ssh root@"$STORAGE_AMSTERDAM_IP" $CMD
ssh root@"$STORAGE_BANGALORE_IP" $CMD
ssh root@"$STORAGE_SINGAPORE_IP" $CMD





