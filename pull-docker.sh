#!/bin/bash
ENV_LOCATION=$PWD/.env
echo $ENV_LOCATION
source $ENV_LOCATION

mkdir -p /tmp/uploads
rm -rf /tmp/uploads/*
docker pull presto412/storev1:latest
docker swarm leave -f
