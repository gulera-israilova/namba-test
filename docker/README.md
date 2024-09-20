# docker

```sh

# Start the services
docker compose -f docker/docker-compose.yaml up -d --build --force-recreate --remove-orphans

# Check the running containers
docker ps

# Check all containers
docker ps -a

# Check logs of containers
docker logs -f order-create
docker logs -f order-update
# etc.

```
