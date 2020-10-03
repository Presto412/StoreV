#!/bin/bash

docker build -t=presto412/storev1 .
ENV_LOCATION=.env
source $ENV_LOCATION
mkdir -p /tmp/uploads
docker swarm leave -f
docker swarm init
docker network create --attachable --driver overlay --subnet=10.200.1.0/24 "$NETWORK_NAME"

docker stack deploy -c docker-compose-dev.yaml test
