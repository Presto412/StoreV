#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
source $ENV_LOCATION
mkdir -p /tmp/uploads
docker swarm leave -f
docker swarm init --advertise-addr "$CENTRAL_NYC_IP"
docker network create --attachable --driver overlay --subnet=10.200.1.0/24 "$NETWORK_NAME"