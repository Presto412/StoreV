#!/bin/bash
mkdir -p /tmp/uploads
rm -rf /tmp/uploads/*
docker pull presto412/storev1:latest
docker swarm leave -f
docker swarm join --token SWMTKN-1-3tjsxp8ix2vcck4com1h47lxt7qpb60k7pcguhi6yv4iqarnwl-eiladdltl3di0h98fjg5xya5k 178.128.147.66:2377
