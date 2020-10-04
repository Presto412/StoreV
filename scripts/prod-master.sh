#!/bin/bash

ENV_LOCATION=$PWD/.env
source $ENV_LOCATION
USER="root"

ssh "$USER"@"$STORAGE_TORONTO_IP" 'bash -s' < ./scripts/install-docker.sh
ssh "$USER"@"$STORAGE_AMSTERDAM_IP" 'bash -s' < ./scripts/install-docker.sh
ssh "$USER"@"$STORAGE_BANGALORE_IP" 'bash -s' < ./scripts/install-docker.sh
ssh "$USER"@"$STORAGE_SINGAPORE_IP" 'bash -s' < ./scripts/install-docker.sh
ssh "$USER"@"$CENTRAL_NYC_IP" 'bash -s' < ./scripts/install-docker.sh


ssh "$USER"@"$STORAGE_TORONTO_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh "$USER"@"$STORAGE_AMSTERDAM_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh "$USER"@"$STORAGE_BANGALORE_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh "$USER"@"$STORAGE_SINGAPORE_IP" 'bash -s' < ./scripts/pull-docker.sh
ssh "$USER"@"$CENTRAL_NYC_IP" 'bash -s' < ./scripts/pull-docker.sh

scp .env "$USER@$CENTRAL_NYC_IP:.env"
scp "./docker-compose-$NODE_ENV.yaml" "$USER@$CENTRAL_NYC_IP:docker-compose-$NODE_ENV.yaml"

CMD=$(ssh "$USER"@"$CENTRAL_NYC_IP" < ./scripts/create-network.sh | grep 'docker swarm join --token SWMTKN.*' -o)

ssh "$USER"@"$STORAGE_TORONTO_IP" "$CMD"
ssh "$USER"@"$STORAGE_AMSTERDAM_IP" "$CMD"
ssh "$USER"@"$STORAGE_BANGALORE_IP" "$CMD"
ssh "$USER"@"$STORAGE_SINGAPORE_IP" "$CMD"

ssh "$USER"@"$CENTRAL_NYC_IP" "docker stack deploy -c docker-compose-$NODE_ENV.yaml test"
