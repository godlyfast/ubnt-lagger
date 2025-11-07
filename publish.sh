source pf-router/scripts/utils/load_env.sh

read_env
IMAGES_IDS=$(docker images --format="{{.Repository}} {{.ID}}" | grep "^$DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/shms " | cut -d' ' -f2)
echo IMAGES $IMAGES_IDS
if [ -n "$IMAGES_IDS" ]
then
      echo "Removing old Images"
      docker rmi $IMAGES_IDS

else
      echo "No old Images found"
fi
# Build for linux/amd64 (server architecture) using multi-stage build
docker build . --platform linux/amd64 -t $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/shms:latest
IMAGE_ID=$(docker images --format="{{.Repository}} {{.ID}}" | grep "^$DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/shms " | cut -d' ' -f2)
echo IMAGE $IMAGE_ID
docker tag $IMAGE_ID $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/shms:latest
docker image push --tls-verify=false $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/shms:latest