module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "chat",
      script    : "server/server.js",
      "out_file": "log/all.log", // log会保存在工程跟目录下的log/all.log中
      "error_file": "log/all.log",
      "log_date_format" : "YYYY-MM-DD HH:mm Z",
      "env" : {
         "NODE_ENV": "product"
      }
    }
  ]
}
