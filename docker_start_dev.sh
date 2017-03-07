#!/bin/bash
docker build -f ./Dockerfile_dev -t chat_dev .

docker stop chat_dev
docker run --rm -it -d -v /root/chat:/root/chat -p 3000:3000 --name chat_dev chat_dev

docker exec -it chat_dev /bin/bash
