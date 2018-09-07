'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
class BusinessController extends Controller {
/**
   * 新建往来信息
   */
  async creat() {
    const { ctx } = this;
    const newGoods = new ctx.model.Business(ctx.request.body);
    try {
      const goods = await newGoods.save();
      ctx.body = { goods };
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '新建往来信息失败' };
    }
  }

  /**
   * 更新往来信息
   */
  async update() {
    const { ctx } = this;
    const reqBody = ctx.request.body;
    if (reqBody._id) {
      delete reqBody._id;
    }
    try {
      const goods = await ctx.model.Business.findById(ctx.params.id);
      if (!goods) {
        ctx.body = { err: '往来信息不存在' };
        return;
      }
      const updated = _.assign(goods, reqBody);
      ctx.body = await updated.save();
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '更新往来信息失败' };
    }

  }

  /**
   * 删除往来信息
   */
  async destroy() {
    const { ctx } = this;
    try {
      await ctx.model.Business.findByIdAndRemove(ctx.params.id);
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '删除往来信息失败' };
    }
  }

  /**
   * 获取发货用户不同交易状态的交易消息
   * parameter: status    交易状态
   */
  async getGoodsOfSender() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const confirmStatus = ctx.query.status;
    ctx.body = await ctx.model.Business.find({ sendOpenid: user.weixin_openid, status: confirmStatus });
  }

  /**
   * 获取发货用户的交易消息
   * parameter: status    交易状态
   */
  async getAllGoodsOfSender() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const confirmStatus = ctx.query.status || '4';
    try {
      ctx.body = await ctx.model.Business.find({ sendOpenid: user.weixin_openid, status: { $lte: confirmStatus } });
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取发货信息失败' };
    }

  }

  /**
   * 获取收货用户不同交易状态的交易信息
   * parameter: status    交易状态
   */
  async getGoodsOfReceive() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const confirmStatus = ctx.query.status;
    ctx.body = await ctx.model.Business.find({ reciveOpenid: user.weixin_openid, status: confirmStatus });
  }

  /**
   * 获取收货用户的交易信息
   * parameter: status    交易状态
   */
  async getAllGoodsOfReceive() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const confirmStatus = ctx.query.status || '4';
    ctx.body = await ctx.model.Business.find({ reciveOpenid: user.weixin_openid, status: { $lte: confirmStatus } });
  }

  /**
   * 统计用户的已经付款的信息
   */
  async getSumPayOfReceive() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    try {
      const goodsinfos = await ctx.model.Business.aggregate([
        {
          $match: {
            reciveOpenid: user.weixin_openid,
            status: { $in: [ '3', '4' ] },
          },
        },
        {
          $sort: {
            sendOpenid: 1,
          },
        },
        {
          $group: {
            _id: '$sendOpenid',
            records: {
              $sum: 1,
            },
            payments: {
              $sum: '$payments',
            },
            sendOpenid: {
              $first: '$sendOpenid',
            },
          },
        },
      ]);
      if (goodsinfos.length === 0) {
        ctx.body = goodsinfos;
        return;
      }
      const userOpenids = _.map(goodsinfos, item => {
        return item.sendOpenid;
      });
      const userNames = await ctx.model.User.find({ weixin_openid: { $in: userOpenids } }, 'weixin_openid, name');
      const userInfos = {};
      _.forEach(userNames, item => {
        userInfos[item.weixin_openid] = item.name;
      });
      ctx.body = _.map(goodsinfos, item => {
        item.name = userInfos[item.sendOpenid];
        return item;
      });
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '查询已付款统计信息失败' };
    }
  }

  /**
   * 统计用户的已经收款的信息
   */
  async getSumPayOfSender() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    try {
      const goodsinfos = await ctx.model.Business.aggregate([
        {
          $match: {
            sendOpenid: user.weixin_openid,
            status: '4',
          },
        },
        {
          $sort: {
            reciveOpenid: 1,
          },
        },
        {
          $group: {
            _id: '$reciveOpenid',
            records: {
              $sum: 1,
            },
            payments: {
              $sum: '$payments',
            },
            reciveOpenid: {
              $first: '$reciveOpenid',
            },
          },
        },
      ]);
      if (goodsinfos.length === 0) {
        ctx.body = goodsinfos;
        return;
      }
      const userOpenids = _.map(goodsinfos, item => {
        return item.reciveOpenid;
      });
      const userNames = await ctx.model.User.find({ weixin_openid: { $in: userOpenids } }, 'weixin_openid, name');
      const userInfos = {};
      _.forEach(userNames, item => {
        userInfos[item.weixin_openid] = item.name;
      });
      ctx.body = _.map(goodsinfos, item => {
        item.name = userInfos[item.reciveOpenid];
        return item;
      });
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '查询已收款统计信息失败' };
    }
  }

}

module.exports = BusinessController;
