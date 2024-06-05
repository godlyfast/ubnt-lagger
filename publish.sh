docker build . --platform linux/amd64 -t lagger:latest
docker tag lagger:latest 192.168.55.100/lagger:latest
docker image push 192.168.55.100:5000/lagger:latest