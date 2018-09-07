'use strict';

const Controller = require('egg').Controller;
/**
 * @class UserController
 * @extends {Controller}
 */
class UserController extends Controller {
  async index() {
    const {
      ctx,
    } = this;
    ctx.body = await ctx.service.user.pageFind();
  }

  async getAll() {
    this.ctx.body = await this.ctx.service.user.findAll();
  }
  /**
   * 注册用户
   */
  async create() {
    const {
      ctx,
    } = this;
    const result = await ctx.service.user.creat();
    ctx.body = result;
  }

  /**
   * 修改用户
   */
  async update() {
    const {
      ctx,
    } = this;
    const result = await ctx.service.user.update();
    ctx.body = result;
  }

  /**
   * 删除用户
   */
  async destroy() {
    const {
      ctx,
    } = this;
    await ctx.service.user.destroy();
    ctx.status = 204;
  }
  /**
   * 用户登录
   */
  async login() {
    const {
      ctx,
    } = this;
    const result = await ctx.service.user.login();
    ctx.body = result;
    if (result.err) {
      ctx.status = 422;
    }
  }

  /**
   * 查询已登录用户信息
   */
  async me() {
    const {
      ctx,
    } = this;
    try {
      const result = await ctx.service.user.me();
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  }

  /**
   * 修改密码
   */
  async changPasswd() {
    const {
      ctx,
    } = this;
    await ctx.service.user.changPasswd();
  }

  async getUsers() {
    const {
      ctx,
    } = this;
    const result = await ctx.service.user.getUsers();
    ctx.body = result;
  }

  /**
   * 微信用户注册登录
   * 返回用户信息和token
   */
  async wxlogin() {
    const { ctx, app } = this;
    const { code, userInfo } = ctx.request.body;
    const { WXAPPID, WXSECRET } = app.config;
    const wxurl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WXAPPID}&secret=${WXSECRET}&js_code=${code}&grant_type=authorization_code`;
    try {
      const wxResult = await ctx.curl(wxurl,  { dataType: 'json' });
      const sessionData = wxResult.data;
      if (!sessionData.openid) {
        ctx.logger.error('获取Openid失败');
        this.ctx.throw(500, '获取Openid失败');
      }
      // 验证用户信息完整性
      const crypto = require('crypto');
      const sha1 = crypto.createHash('sha1').update(userInfo.rawData + sessionData.session_key).digest('hex');
      if (userInfo.signature !== sha1) {
        ctx.logger.error('获取Openid失败');
        this.ctx.throw(500, '获取Openid失败');
      }
      const openid = sessionData.openid;
      const user = await ctx.model.User.findOne({ weixin_openid: openid });
      if (!user) {
        // 注册新用户
        const userData = userInfo.userInfo;
        const newUser = new ctx.model.User({
          username: `wx_${openid}`,
          password: openid,
          weixin_openid: openid,
          avatar: userData.avatarUrl || '',
          gender: userData.gender || 1, // 性别 0：未知、1：男、2：女
          name: userData.nickName,
        });
        try {
          await newUser.save();
        } catch (err) {
          ctx.logger.error('注册微信用户失败');
          this.ctx.throw(500, '注册微信用户失败');
        }
      }
      ctx.body = await ctx.service.user.wxlogin({ username: `wx_${openid}`, password: openid });
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '微信登录失败' };
    }
  }
}

module.exports = UserController;
