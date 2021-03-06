#!/bin/bash

mkdir -p /root/chat/log

echo "[chat] start docker build ..."
docker build -f ./Dockerfile -t chat .

echo "[chat] stop the current running container ..."
docker stop chat

echo "[chat] delete chat container"
docker rm chat

echo "[chat] run docker ..."
docker run --rm -it -d -v /root/chat/log/:/root/chat/log/ -p 3005:3005 --name chat --link db:db chat

echo "[chat] start node server ..."
docker exec -it chat /bin/bash -c "NODE_ENV=product pm2 start /root/chat/ecosystem.config.js" 

CMD_EXEC="docker exec -it chat /bin/bash"
echo -e "use the following command to access the container \n$CMD_EXEC"
