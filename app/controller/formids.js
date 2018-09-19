'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class FormidsController extends Controller {

  /**
   * 保存formids到redis中
   */
  async SaveFormids() {
    const { ctx, app } = this;
    try {
      const form = ctx.request.body;
      const { openid, formids } = form;
      const redis = app.redis;
      const jsonform = JSON.parse(formids);
      _.forEach(jsonform, item => {
        const strItem = JSON.stringify(item);
        redis.rpush(openid, strItem);
      });
      ctx.body = { msg: 'OK' };
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '保存formids失败' };
    }
  }
}

module.exports = FormidsController;
