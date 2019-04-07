#!/bin/bash
mkdir -p /tmp/uploads
rm -rf /tmp/uploads/*
docker pull presto412/storev1:latest
docker swarm leave -f
docker swarm join --token SWMTKN-1-13bdl2qdigqernaevy9o86mt1kbwtvdrrxjbm4ev6dsyuffw7t-6utpdwjjjtxt12s26rnomznjz 178.128.147.66:2377

