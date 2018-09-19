'use strict';
const path = require('path');
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536024891387_5942';
  // 自定义的中间件配置
  config.middleware = [ 'isauth', 'errorHandler' ];

  config.userRoles = [ 'guest', 'users', 'admin' ];      // 用户角色
  config.WXAPPID = 'wxe534ec675351ac24';                // 小程序 appid
  config.WXSECRET = 'ddc0d42a2ee55a4f32613ec4a595a4ef'; // 小程序密钥
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27018/wanlai',
    options: {
      useNewUrlParser: true,
    },
  };
  config.logger = {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
    dir: path.join(appInfo.root, '/logs'),
  };
  // 设置静态文件的路径
  config.static = {
    prefix: '/static',
    dir: path.join(appInfo.baseDir, '/app/public/static'),
  };
  // csrf安全检查是否开启
  config.security = {
    csrf: {
      enable: false,
    },
  };
  // 解析request的参数设置
  config.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '500kb',
    jsonLimit: '500kb',
  };
  // 错误处理中间件
  config.errorHandler = {
    match: '/api',
  };

  config.isauth = {
    // 不需要检查授权的路由
    ignore(ctx) {
      const reg = /index|admin|login|imgupload|static|front|banner/i;
      const result = reg.test(ctx.request.url);
      return result;
    },
  };
  // 上传文件的目录
  config.uploads = path.join(appInfo.baseDir, '/app/public/static/uploads');
  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [ 'socketauth' ],
        packetMiddleware: [],
      },
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
      auth_pass: 'nutshell750090',
      db: 0,
    },
  };
  // redis插件的设置
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: 'nutshell750090',
      db: 0,
    },
  };
  return config;
};
