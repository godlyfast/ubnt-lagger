source pf-router/scripts/utils/load_env.sh

read_env

ssh -i $DEPLOY_SERVER_SSH_KEY_PATH $DEPLOY_SERVER_USER@$DEPLOY_SERVER_IP "
  docker stop shms
  docker rm shms
  docker rmi localhost:$DOCKER_REPOSITORY_PORT/shms:latest
  docker pull localhost:$DOCKER_REPOSITORY_PORT/shms:latest
  docker run -d --restart unless-stopped --name shms -p 3003:3000 --platform linux/amd64 localhost:$DOCKER_REPOSITORY_PORT/shms:latest
  "