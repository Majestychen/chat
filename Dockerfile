FROM centos:7

ENV SOURCE_DIR /root/chat/

# install wget
RUN yum install -y wget

# suport epel repo for centos7
RUN wget http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-9.noarch.rpm
RUN rpm -ivh epel-release-7-9.noarch.rpm

# install nodejs 4.5.0 & npm
RUN yum install -y libicu libuv
RUN rpm -ivh http://mirrors.163.com/centos/7/opstools/x86_64/common/nodejs-4.5.0-1.el7.x86_64.rpm

# install
RUN yum install -y git make python gcc-c++

# copy source
RUN mkdir -p $SOURCE_DIR
COPY ./* $SOURCE_DIR

# npm install (global)
RUN npm install -g node-gyp forever

# npm install
WORKDIR $SOURCE_DIR
RUN npm install