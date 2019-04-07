#!/bin/bash
mkdir -p /tmp/uploads
rm -rf /tmp/uploads/*
docker pull presto412/storev1:latest
docker swarm leave -f
docker swarm join --token SWMTKN-1-105iqilbuf61xt59yxy6t8z2fd0s7by4a0tffrtg8r33yqo52s-8m242km3w6tof0o1578ul6443 178.128.147.66:2377
