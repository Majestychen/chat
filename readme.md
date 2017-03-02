* nodejs version

	5.7.0

* nodejieba

	* 概述

		由于希望给聊天增加词频统计功能，需要进行分词  
		nodejieba正是一个较好的node分词工具。

	* 安装（windows - gitBash）

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

