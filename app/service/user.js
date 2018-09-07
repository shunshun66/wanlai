"use strict";

const Service = require('egg').Service;
const jwt = require('jsonwebtoken');
const paging = require('../common/paging');
const _ = require('lodash');
class UserService extends Service {
  /**
   * 分页查询用户信息
   */
  async pageFind() {
    try {

      let search = this.ctx.query.search;
      let page = this.ctx.query.page;
      if (!search) {
        search = {};
      }
      if (_.isString(search)) {
        search = JSON.parse(search)
      }
      if (_.isString(page)) {
        page = JSON.parse(page)
      }

      // 修改为模糊查询
      for (const key in search) {
        search[key] = new RegExp(search[key])
      }
      const user = this.ctx.session.user ? this.ctx.session.user : this.ctx.req.user
      if (user.role !== 'admin') {
        search = _.merge(search, {
          companyID: user.companyID
        })
      }
      const userModel = this.ctx.model.User
      const results = await paging.listQuery(userModel, search, '', '-update_time', page)
      return results
    } catch (err) {
      return {
        err: err
      }
    }
  }

  /**
   * 获取所有用户
   */
  async findAll() {
    try {
      const results = await this.ctx.model.User.find()
      return results
    } catch (err) {
      this.ctx.logger.error(err)
      this.ctx.throw(500, '查询用户失败')
    }
  }

  /**
   * 创建用户
   */
  async creat() {
    const newUser = new this.ctx.model.User(this.ctx.request.body);
    if (!newUser.username) {
      newUser.username = newUser.mobileTel;
    }
    if (!newUser.name) {
      newUser.name = newUser.mobileTel;
    }
    try {
      const user = await newUser.save();
      return {
        user: user
      };
    } catch (err) {
      this.ctx.logger.error(err)
      this.ctx.throw(500, '新建用户失败', {
        data: err
      });
    }
  }

  /**
   * 更新用户
   */
  async update() {
    const reqBody = this.ctx.request.body
    if (reqBody._id) {
      delete reqBody._id
    }
    try {
      const userInfo = await this.ctx.model.User.findById(this.ctx.params.id);
      if (!userInfo) {
        this.ctx.throw(404, '用户不存在');
        return;
      }
      const updated = _.assign(userInfo, reqBody);
      const newUserinfo = await updated.save();
      return newUserinfo;
    } catch (err) {
      this.ctx.throw(500, '用户更新失败', {
        data: err,
      })
    }

  }

  /**
   * 删除用户
   */
  async destroy() {
    try {
      await this.ctx.model.User.findByIdAndRemove(this.ctx.params.id);
    } catch (err) {
      this.ctx.throw(500, '删除用户失败', {
        data: err,
      })
    }
  }

  /**
   * 用户登录
   * 返回用户信息和登录后的token
   */
  async login() {
    const req = this.ctx.request;
    try {
      const user = await this.ctx.model.User.findOne({
        username: req.body.username.toLowerCase()
      })
      if (!user) {
        return {
          err: '用户未注册'
        }
      }
      if (!user.authenticate(req.body.password)) {
        return {
          err: '密码不正确'
        }
      }
      const token = jwt.sign({
        _id: user._id,
        name: user.name,
        role: user.role
      }, this.app.config.keys, {
        expiresIn: '7d'
      })
      this.ctx.logger.debug(token)
      this.ctx.session.user = user
      return {
        user: user,
        token: token
      }
    } catch (error) {
      this.ctx.logger.error(error)
      return {
        err: error
      }
    }
  }

  /**
   * 获取用户信息
   */
  async me() {
    const req = this.ctx.request
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token
    }
    const token = this.ctx.header.authorization // 获取jwt
    if (token) {
      try {
        let payload = await jwt.verify(token.split(' ')[1], this.app.config.keys)
        const userInfo = await this.ctx.model.User.findById(payload._id)
        this.ctx.session.user = userInfo
        return userInfo
      } catch (error) {
        return {
          err: error
        }
      }
    }
  }

  /**
   * 修改密码
   */
  async changPasswd() {
    const req = this.ctx.request
    var userId = this.ctx.session.user._id
    var oldPass = String(req.body.oldPassword)
    var newPass = String(req.body.password)
    try {
      const userInfo = await this.ctx.model.User.findById(userId)
      if (userInfo.authenticate(oldPass)) {
        userInfo.password = newPass
        await userInfo.save()
        this.ctx.status = 200
      } else {
        this.ctx.status = 403
        this.ctx.body = {
          message: 'Old password is not correct.'
        }
      }
    } catch (err) {
      this.ctx.status = 422
    }
  }

  /**
   * 获取所有的用户角色
   */
  async getUsers() {
    try {
      const companys = await this.ctx.model.User.find({
        role: 'users'
      }, 'username companyName')
      return companys
    } catch (err) {
      this.ctx.logger.error(err)
      this.ctx.throw(500, '获取用户失败')
    }
  }


  /**
   * 初期化admin角色
   */
  async initSeed() {
    try {
      const adminInfos = await this.ctx.model.User.find({
        role: 'admin'
      })
      if (!(adminInfos && adminInfos.length)) {
        await this.ctx.model.User.create({
          role: 'admin',
          name: 'Admin',
          username: 'admin',
          password: 'admin'
        })
      }
    } catch (err) {
      this.ctx.logger.error(err)
      this.ctx.throw(500, '初期化用户表失败')
    }

  }

  /**
   * 微信用户登录
   * 返回用户信息和登录后的token
   */
  async wxlogin({ username, password }) {
    try {
      const user = await this.ctx.model.User.findOne({
        username: username.toLowerCase(),
      });
      if (!user) {
        return {
          err: '用户未注册',
        };
      }
      if (!user.authenticate(password)) {
        return {
          err: '密码不正确',
        };
      }
      const token = jwt.sign({
        _id: user._id,
        name: user.name,
        wx_openid: user.weixin_openid,
        role: user.role,
      }, this.app.config.keys, {
        expiresIn: '7d',
      });
      this.ctx.logger.debug(token);
      this.ctx.session.user = user;
      return {
        user,
        token,
      };
    } catch (error) {
      this.ctx.logger.error(error);
      return {
        err: error,
      };
    }
  }
}
module.exports = UserService;
