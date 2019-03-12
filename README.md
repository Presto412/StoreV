# Parallel-Encryption-Decryption

## Description

Encrypts the image using DES algorithm using parallel and distributed computation with the help of Docker Swarm. Runs on 2 systems.

## Steps to run

- Build the docker image

```bash
./setup-docker.sh
```

- Create a `.env` file like the `.env.example` file

- Clone the repository in both systems and copy the files

```bash
./copy-files.sh
```

- If running in multiple systems,
  - Replace hostnames in [Config file](./docker-compose.yaml), lines 17 and 40
  - set-up the docker swarm network

```bash
./create-network.sh
```

- If running in a single system,

```bash
docker-compose -f ./docker-compose.yaml up
```

- This will start the servers in both cases. Send a curl command to initiate the encryption

```bash
curl http://localhost:3000/encrypt -o output.jpg
```

- The encrypted image will be present in `/usr/src/app`
