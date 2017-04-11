FROM centos:7

ENV SOURCE_DIR /root/chat

# set system time zone to CHINA
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# SET DIR COLOR
RUN cp /etc/DIR_COLORS ~/.dir_colors \
	&& sed -i "s/DIR 01;34/DIR 01;33/" ~/.dir_colors

# install node npm by NVM
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 7.0.0
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# EPEL SUPPORT: http://elrepo.org/tiki/tiki-index.php
RUN rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
RUN rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm


# install
RUN yum install -y git make python gcc-c++

# npm install (global)
RUN echo "registry=https://registry.npm.taobao.org" >> ~/.npmrc

# PM2 install
RUN npm install -g grunt-cli pm2 node-gyp

# Prepare dir
RUN mkdir -p $SOURCE_DIR
WORKDIR $SOURCE_DIR/

# COPY package.json & NPM INSTALL
COPY ./package.json $SOURCE_DIR/package.json
RUN npm install

# 由于阿里云主机配置太低，为了防止npm install 死机，单独安装nodejieba
RUN npm install nodejieba

# COPY source
COPY . $SOURCE_DIR/

# webpack code package
RUN npm run product

