# StoreV

A Storage Virtualization implementation, that considers backups and de-duplication.

## Introduction

In this project, I had deployed four storage servers via [DigitalOcean](http://www.digitalocean.com) in Amsterdam, Bangalore, Toronto and Singapore data centres. The central server is in New York. The aim was to replicate a newly uploaded file and store it in two of the four servers. When there is a download request, the file is downloaded from the server that is the closest geographically. Using this technique, users do not have to be worried about the specific location of their file. It allows the pooling of physical storage from multiple storage devices into what appears to be a single storage device being managed from a central console. The use of hashes in this project prevents the user from adding redundant data, ie, before uploading a file, hashing is performed, to check if it exists in the system. This solves data-deduplication. An example metadata storage is given [here](./data/sample.json)

## Architecture

![arch](/assets/arch.jpg)

## Stack

- Node.js(Express), EJS Templates
- Docker, Docker Swarm

## Development Steps

- Build the docker image

```sh
./scripts/setup-docker.sh
```

- Create a `.env` file like the `.env.example` file
- Get an access key from [IPSTACK](https://ipstack.com/) (It's free)
- Set the `NODE_ENV` value to `dev`
- Run `./scripts/dev-master.sh`
- Go to [localhost](http://0.0.0.0:3000)

## Deploying to production

- Clone the repository in a local system
- Make sure you've ssh installed and configured
- Set up all the servers, and add your public key found in `.ssh/`
- Create a `.env` file like the `.env.example` file, with all corresponding IPs
- Set the `NODE_ENV` value to `prod`
- Setup docker, pull the images and start the network
  ```sh
  ./scripts/prod-master.sh
  ```
- Check out port 3000 on your central IP and it should be running
