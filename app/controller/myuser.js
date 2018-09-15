'use strict';

const Controller = require('egg').Controller;
const { listQuery } = require('../common/paging');
const _ = require('lodash');
class MyuserController extends Controller {
  async index() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    try {
      ctx.body = await ctx.model.Myuser.find({ userID: user._id });
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取我的客户失败' };
    }
  }

  /**
   * 通过昵称来查找用户的openid
   */
  async findByName() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const nickName = new RegExp(ctx.query.name);
    try {
      let results = await ctx.model.Myuser.find({ userID: user._id,  name: nickName }, 'name weixin_openid');
      if (results.length === 0) {
        results = await ctx.model.User.find({ name: nickName }, 'name weixin_openid');
      }
      ctx.body = results;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取客户信息失败' };
    }
  }

  /**
   * 创建客户
   */
  async create() {
    const {
      ctx,
    } = this;
    const user = ctx.session.user || ctx.request.user;
    const form = ctx.request.body;
    form.userID = user._id;
    const myuser = new ctx.model.Myuser(form);
    try {
      ctx.body = await myuser.save();
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = {
        err: '创建客户失败',
      };
    }
  }

  /**
   * 修改用户
   */
  async update() {
    const {
      ctx,
    } = this;
    const form = ctx.request.body;
    if (form._id) {
      delete form._id;
    }
    try {
      const userInfo = await this.ctx.model.Myuser.findById(ctx.params.id);
      if (!userInfo) {
        ctx.logger.error('客户信息不存在');
        ctx.body = { err: '客户信息不存在' };
        return;
      }
      const updated = _.assign(userInfo, form);
      const newUserinfo = await updated.save();
      ctx.body = newUserinfo;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '客户信息更新失败' };
    }
  }

  /**
   * 删除用户
   */
  async destroy() {
    const {
      ctx,
    } = this;
    try {
      ctx.body = await ctx.model.Myuser.findByIdAndRemove(this.ctx.params.id);
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '删除客户信息失败' };
    }
  }

  /**
   * 分页获取我的用户
   */
  async getMyuserBypage() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    let page = ctx.query.page || { current: 1, limit: 10 };

    try {
      if (typeof page === 'string') {
        page = JSON.parse(page);
      }
      let search = { userID: user._id };
      const value = ctx.query.value;
      if (value) {
        const strValue = new RegExp(value);
        const subsql = { name: strValue };
        search = _.merge(search, subsql);
      }
      const userPage = await listQuery(ctx.model.Myuser, search, '', 'name', page);
      ctx.body = userPage;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取我的客户信息失败' };
    }
  }
}

module.exports = MyuserController;
