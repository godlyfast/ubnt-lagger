docker build . --platform linux/amd64 -t 192.168.55.100:5000/shms:latest
IMAGE_ID=$(docker images --format="{{.Repository}} {{.ID}}" | grep "^192.168.55.100:5000/shms " | cut -d' ' -f2)
docker tag $IMAGE_ID 192.168.55.100:5000/shms:latest
docker image push 192.168.55.100:5000/shms:latest