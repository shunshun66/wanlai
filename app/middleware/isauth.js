'use strict';
/**
 * 判断用户是否已经登录
 */
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
module.exports = options => {
  return async function isAuth(ctx, next) {
    const req = ctx.request;
    const reg = /api/i;
    const clientResult = reg.test(ctx.request.url)
    if (req.query && req.query.hasOwnProperty('access_token')) {
      ctx.headers.authorization = 'Bearer ' + req.query.access_token
    }
    const indexFile = path.join(ctx.app.config.static.dir, '../index.html')
    const token = ctx.header.authorization // 获取jwt
    if (token) {
      try {
        const payload = await jwt.verify(token.split(' ')[1], ctx.app.config.keys);
        if (payload && payload._id) {
          req.user = await ctx.model.User.findById(payload._id);
          await next();
        } else {
          if (!clientResult) {
            ctx.type = 'html'
            ctx.body = fs.createReadStream(indexFile)
            return
          }
          ctx.body = {
            err: '未登录'
          }
          ctx.status = 401
        }
      } catch (error) {
        ctx.logger.error(error)
        if (!clientResult) {
          ctx.type = 'html'
          ctx.body = fs.createReadStream(indexFile)
          return
        }
        ctx.body = {
          err: '未登录'
        }
        ctx.status = 401
      }
    } else {
      if (!clientResult) {
        ctx.type = 'html'
        ctx.body = fs.createReadStream(indexFile)
        return
      }
      ctx.body = {
        err: '未登录'
      }
      ctx.status = 401
    }
  }
}