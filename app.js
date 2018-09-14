'use strict';

const qs = require('koa-qs');
const tools = require('./util/tools');
module.exports = app => {
  app.beforeStart(async () => {
    // 查询参数解析为对象
    qs(app);
    const ctx = app.createAnonymousContext();
    // 初期化admin用户
    await ctx.service.user.initSeed();
    // 创建上传文件的目录
    tools.mkdirsSync(app.config.uploads);
  });
};
