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
      env_production : {
        NODE_ENV: "product"
      },
      "out_file": "all.log",
      "error_file": "all.log",
      "log_date_format" : "YYYY-MM-DD HH:mm Z"
    }
  ]
}
