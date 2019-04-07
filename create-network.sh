#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
echo $ENV_LOCATION
source $ENV_LOCATION
mkdir -p /tmp/uploads
docker swarm leave -f
docker swarm init --advertise-addr 178.128.147.66
docker network create --attachable --driver overlay --subnet=10.200.1.0/24 "$NETWORK_NAME"


#docker stack deploy -c docker-compose-"$NODE_ENV".yaml test
