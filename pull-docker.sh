#!/bin/bash
mkdir -p /tmp/uploads
docker pull presto412/storev1:latest
docker swarm leave -f
# docker swarm join --token SWMTKN-1-15772m8nkaw873zo25bsmvusxm17zlh7ulgpid6nymken7esmg-crkv55kaytus5p5fh54vm1c2k 178.128.147.66:2377

