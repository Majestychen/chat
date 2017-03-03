* nodejs version

	4.3.1

* nodejieba

	* 概述

		由于希望给聊天增加词频统计功能，需要进行分词  
		nodejieba正是一个较好的node分词工具。

	* 安装（windows - gitBash） (失败)

		* 开始nodejs为4.3.0，无法安装成功，后来看nodejieba在node 5.7.0下测试是能正常运行的，所以切换到node 5.7.0
		* 首先安装 windows-nvm 来管理node的各个版本

			https://github.com/coreybutler/nvm-windows  
			安装要注意，不要安装到 c:\program files下，因为后续会因为路径中的空格导致很多问题  
			我是安装在了 c:\software\nvm下面
		* `nvm install 5.7.0`
		* `nvm use 5.7.0`
		* `npm install nodejieba --save-dev` 报错，可以看到，需要安装python

			我安装的python 2.7.0
		* `npm install nodejieba --save-dev` 继续报错，可以看到，需要安装 node-gyp

			`npm install node-gyp --save-dev`
		* `npm intall nodejieba --save-dev` 成功！
		* 到此安装成功，但是实际使用报错

			需要使用C++编译，官网上很多人都反映windows上编译有问题  
			没有继续调查

		* 最终该结论

			安装失败， 最终决定在windows上用docker开发

	* 安装（centos）

		* 需要先安装node-gyp

			node-gyp是用来编译nodejieba用的，因为nodejieba底层使用的是C++  
			https://github.com/nodejs/node-gyp#installation
	
			* make

				`yum install make`

			* python (2.x)

				`yum install python`

			* C++11 Compiler (node 0.12.1版本需要普通的c++就行，node > 4.x版本需要 c++ 11)

				http://hiltmon.com/blog/2015/08/09/c-plus-plus-11-on-centos-6-dot-6/  
				`wget http://people.centos.org/tru/devtools-2/devtools-2.repo -O /etc/yum.repos.d/devtools-2.repo`  
				`yum install -y devtoolset-2-gcc devtoolset-2-binutils devtoolset-2-gcc-c++`  
				`scl enable devtoolset-2 bash`  
				`echo ". /opt/rh/devtoolset-2/enable" >> ~/.bash_profile`

			* node-gyp

				`npm install -g node-gyp`


		* nodejieba

			`npm install nodejieba`

* windows上进行docker开发

	* 文件映射

		* 三层关系

			windows -> virtualbox 上的linux虚拟机 -> 运行在linux上的docker container

		* 文件如何映射

			* 首先需要进行 windows和virtualbox间的文件映射

				启动virtualbox虚拟机，运行boot2docker  
				在虚拟机的文件共享中设定共享 chat -> c:\gitWorkspace\chat  
				然后到linux上进行mount `mount -t vboxsf chat /root/chat`  
				注意chat 是一个名字，一放连着windows（在virtualbox中设定）  
				另一方连着linux（通过mount命令执行）  
				取消mount命令`umount -a`

			* 然后进行 vitualbox的linux和 docker container的映射

				-v 参数， 宿主机目录 : docker容器目录  
				`docker run -it -d -p 3000:3000 -v /root/chat:/root/chat --name chat yisuren/chat`

* 安装，运行

	```
	docker run -it -d -p 3000:3000 -v /root/chat:/root/chat --name chat yisuren/chat
	docker exec -it chat /bin/bash

	# 使用gitBash连接boot2docker (gitBash对中文支持好)
	docker-machine.exe ssh default
	su
	```
				