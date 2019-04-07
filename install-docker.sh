#!/bin/bash
# set -ev

echo "Uninstalling older versions---"
apt-get remove docker docker-engine docker.io containerd runc

echo "Update"
( echo Y ) | apt-get update

echo "Installing reqd. stuff"
( echo Y ) \
 | apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

echo "---Downloading docker--"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

echo "---Adding repo--"
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

echo "--updating"
( echo Y ) | apt-get update


echo "---installing"
( echo Y ) | apt-get install docker-ce docker-ce-cli containerd.io
