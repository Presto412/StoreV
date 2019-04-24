#!/bin/bash
# set -ev

ENV_LOCATION=$PWD/.env
echo $ENV_LOCATION
source $ENV_LOCATION


docker stack deploy -c docker-compose-"$NODE_ENV".yaml test
