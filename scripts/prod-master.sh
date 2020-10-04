#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
source $ENV_LOCATION

ssh root@"$STORAGE_TORONTO_IP" 'bash -s' < ./scripts/install-docker.sh
ssh root@"$STORAGE_AMSTERDAM_IP" 'bash -s' < ./scripts/install-docker.sh
ssh root@"$STORAGE_BANGALORE_IP" 'bash -s' < ./scripts/install-docker.sh
ssh root@"$STORAGE_SINGAPORE_IP" 'bash -s' < ./scripts/install-docker.sh
ssh root@"$CENTRAL_NYC_IP" 'bash -s' < ./scripts/install-docker.sh


ssh root@"$STORAGE_TORONTO_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh root@"$STORAGE_AMSTERDAM_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh root@"$STORAGE_BANGALORE_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh root@"$STORAGE_SINGAPORE_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh root@"$CENTRAL_NYC_IP" 'bash -s' < ./scripts/pull-docker.sh

CMD="$(ssh root@$CENTRAL_NYC_IP 'bash -s' < create-network.sh | grep -P 'docker swarm join --token SWMTKN.*' -o)"

ssh root@"$STORAGE_TORONTO_IP" $CMD
ssh root@"$STORAGE_AMSTERDAM_IP" $CMD
ssh root@"$STORAGE_BANGALORE_IP" $CMD
ssh root@"$STORAGE_SINGAPORE_IP" $CMD

ssh root@"$CENTRAL_NYC_IP" "bash -s docker stack deploy -c docker-compose-"$NODE_ENV".yaml test"
