* 注意事项

	* 不要试图在windows下安装nodejieba，涉及到C++的编译，会有很多问题，看命了~
	* 不要试图将docker image push到 www.dockerhub.com上

		由于网络原因速度会很慢，而且经常失败  
		正确的做法是：从dockerhub pull下来centos:7，然后通过Dockerfile进行build

* nodejs version

	7.0.0

* 启动(dev)

	* 开发

		nodemon server/server.js  
		http://localhost:3005/index_dev.html

	* 产品

		npm run product  
		NODE_ENV=product pm2 start --name chat server/server.js  
		http://your_ip_address:3005

* Docker

	参考 [Dockerfile](./Dockerfile)

* nodejieba

	* 概述

		由于希望给聊天增加词频统计功能，需要进行分词  
		nodejieba正是一个较好的node分词工具。

	* 参考

		https://github.com/fxsjy/jieba

	* 安装（centos）

		* 需要先安装node-gyp

			node-gyp是用来编译nodejieba用的，因为nodejieba底层使用的是C++  
			https://github.com/nodejs/node-gyp#installation
	
			* make

				`yum install make`

			* python (2.x)

				`yum install python`

			* C++11 Compiler (node 0.12.1版本需要普通的c++就行，node > 4.x版本需要 c++ 11)

				`yum install -y gcc-c++`

			* node-gyp

				`npm install -g node-gyp`


		* nodejieba

			`npm install nodejieba`

* windows上通过docker开发nodejs程序 （概念）

	* 文件映射

		* 三层关系

			windows <-> virtualbox 上的linux虚拟机（boot2docker） <-> 运行在linux上的docker container

		* 文件如何映射

			* 首先需要进行 windows和virtualbox间的文件映射

				启动virtualbox虚拟机，运行boot2docker  
				在虚拟机的文件共享中设定共享 chat -> c:\gitWorkspace\chat  
				然后到linux上进行mount命令  
				`mount -t vboxsf chat /root/chat`  
				注意chat 只是一个名字，一方连着windows（在virtualbox中设定），另一方连着linux（通过mount命令设定）  

			* 然后进行 vitualbox的linux和 docker container的映射

				-v 参数， 宿主机目录 : docker容器目录  
				`docker run -it -d -p 3005:3005 -v /root/chat:/root/chat --name chat yisuren/chat`

* windows上通过docker开发nodejs程序 （操作手顺）

	* DockerToolbox的安装

		参照 http://yisuren.github.io

	* 启动boot2docker虚拟机

	* 设定boot2docker的文件共享 (optional)

		1. virtualbox图形界面设定  
		2. boot2docker中: `mount -t vboxfs chat /root/chat`

	* 使用gitBash ssh进入boot2docker

		gitBash对中文支持的比较好
		```
		docker-machine.exe ls  
		docker-machine.exe ssh default
		sudo -i # root
		```

	* Build image (optional)

		docker build -f ./Dockerfile_dev -t chat_dev .


	* 启动container & 进入

		```
		docker run --rm -it -d -v /root/chat:/root/chat -p 3005:3005 --name chat_dev chat_dev
		docker exec -it chat_dev /bin/bash

		```

* 运行

	* 启动boot2docker虚拟机

	* 进入boot2docker

		docker-machine.exe ls  
		docker-machine.exe ssh default

	* build image & 进入container & 启动服务

		cd /root/chat  
		sh docker_start_dev.sh # 执行后直接进入container中  
		cd /root/chat  
		nodemon server.js

	* 访问

		docker-machine.exe ls # 查看ip地址  
		http://192.168.99.100:3005/
