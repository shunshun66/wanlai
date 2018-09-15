'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
const { listQuery } = require('../common/paging');
const { getWxToken, sendTemplateMsg } = require('../../util/wxtools');
class BusinessController extends Controller {
/**
   * 新建往来信息
   */
  async create() {
    const { ctx, app } = this;
    const user = ctx.session.user || ctx.request.user;
    const form = ctx.request.body;
    const { WXAPPID, WXSECRET } = app.config;
    try {
      form.sendOpenid = user.weixin_openid;
      form.payments = form.prices * form.amount;
      form.status = '1';
      form.sendName = user.name;
      form.reciveName = form.nickname;
      const newGoods = new ctx.model.Business(form);
      const goods = await newGoods.save();
      ctx.body = goods;
      // 保存常用客户
      const myuser = new  ctx.model.Myuser({
        name: ctx.request.body.nickname,
        weixin_openid: ctx.request.body.reciveOpenid,
        userID: user._id,
      });
      try {
        await myuser.save();
      } catch (err) {
        ctx.logger.info(err);
      }
      // 发送发货模板消息
      sendGoodsMsg(ctx, WXAPPID, WXSECRET, form.form_id, user.name, goods).then(result => {
        if (result) {
          ctx.logger.info('发货模板消息发送成功');
        } else {
          ctx.logger.info('发货模板消息发送失败');
        }
      });
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
      const newGoods = await updated.save();
      ctx.body = newGoods;
      if (reqBody.status === '3') {
        const { WXAPPID, WXSECRET } = this.app.config;
        const user = ctx.session.user || ctx.request.user;
        // 发送付款的模板消息
        sendPayMsg(ctx, WXAPPID, WXSECRET, reqBody.form_id, user.name, newGoods).then(result => {
          if (result) {
            ctx.logger.info('付款模板消息发送成功');
          } else {
            ctx.logger.info('付款模板消息发送失败');
          }
        });
      }
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
      await ctx.model.Business.findByIdAndRemove({ _id: ctx.params.id });
      ctx.body = { msg: 'OK' };
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '删除往来信息失败' };
    }
  }

  /**
   * 获取货物清单信息
   * parameter: id      记录ID
   * parameter: flag    收发货方标识   
   */
  async getGoodsById() {
    const { ctx } = this;
    const id = ctx.query.id;
    const flag = ctx.query.flag;
    try {
      const goods = await ctx.model.Business.findById(id);
      const jsonGoods = goods.toJSON();
      jsonGoods.nickname = flag === 'send' ? goods.reciveName : goods.sendName;
      ctx.body = jsonGoods;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取货物清单失败' };
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
    const confirmStatus = ctx.query.status || '2';
    let page = ctx.query.page || { current: 1, limit: 10 };

    try {
      if (typeof page === 'string') {
        page = JSON.parse(page);
      }
      let search = { sendOpenid: user.weixin_openid, status: { $lte: confirmStatus } };
      const value = ctx.query.value;
      if (value) {
        const strValue = new RegExp(value);
        const subsql = {
          $or: [
            {
              goodsName: strValue,
            },
            {
              reciveName: strValue,
            },
          ],
        };
        search = _.merge(search, subsql);
      }
      const goodsPage = await listQuery(ctx.model.Business, search, '', '-sendDate reciveOpenid', page);
      ctx.body = goodsPage;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取发货信息失败' };
    }

  }

  /**
   * 获取已付款的业务信息
   */
  async getPayGoodsOfSender() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    const confirmStatus = ctx.query.status || '3';
    let page = ctx.query.page || { current: 1, limit: 10 };

    try {
      if (typeof page === 'string') {
        page = JSON.parse(page);
      }
      let search = { sendOpenid: user.weixin_openid, status: { $gte: confirmStatus } };
      const value = ctx.query.value;
      if (value) {
        const strValue = new RegExp(value);
        const subsql = {
          $or: [
            {
              goodsName: strValue,
            },
            {
              reciveName: strValue,
            },
          ],
        };
        search = _.merge(search, subsql);
      }
      const goodsPage = await listQuery(ctx.model.Business, search, '', '-sendDate reciveOpenid', page);
      ctx.body = goodsPage;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取已付款信息失败' };
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
    const confirmStatus = ctx.query.status || '2';
    let page = ctx.query.page || { current: 1, limit: 10 };

    try {
      if (typeof page === 'string') {
        page = JSON.parse(page);
      }
      let search = { reciveOpenid: user.weixin_openid, status: { $lte: confirmStatus } };
      let value = ctx.query.value;
      if (value) {
        value = new RegExp(value);
        const subsql = {
          $or: [
            {
              goodsName: value,
            },
            {
              sendName: value,
            },
          ],
        };
        search = _.merge(search, subsql);
      }
      const goodsPage = await listQuery(ctx.model.Business, search, '', '-sendDate sendOpenid', page);
      ctx.body = goodsPage;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取收货信息失败' };
    }
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
            sendName: {
              $first: '$sendName',
            },
          },
        },
      ]);
      ctx.body = goodsinfos;
      return;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '查询已付款统计信息失败' };
    }
  }

  /**
   * 获取总的付款金额
   */
  async getTotalMoneyOfReceive() {
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
          $group: {
            _id: null,
            payments: {
              $sum: '$payments',
            },
          },
        },
      ]);
      ctx.body = goodsinfos[0];
      return;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取总的付款金额失败' };
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
            status: { $in: [ '3', '4' ] },
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
            reciveName: {
              $first: '$reciveName',
            },
          },
        },
      ]);
      ctx.body = goodsinfos;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '查询已收款统计信息失败' };
    }
  }

  /**
   * 获取总的收款金额
   */
  async getTotalMoneyOfSender() {
    const { ctx } = this;
    const user = ctx.session.user || ctx.request.user;
    try {
      const goodsinfos = await ctx.model.Business.aggregate([
        {
          $match: {
            sendOpenid: user.weixin_openid,
            status: { $in: [ '3', '4' ] },
          },
        },
        {
          $group: {
            _id: null,
            payments: {
              $sum: '$payments',
            },
          },
        },
      ]);
      ctx.body = goodsinfos[0];
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '查询总的收款金额失败' };
    }
  }
}

/**
 * 发送发货模板消息
 * @param {*} ctx 
 * @param {*} appid 
 * @param {*} secret 
 * @param {*} formId 
 * @param {*} nickname 
 * @param {*} form 
 */
async function sendGoodsMsg(ctx, appid, secret, formId, nickname, form)  {
  const pageurl = `/pages/goods/goods?id=${form._id}&flag=receive`;
  const nowTime = new Date().toLocaleDateString();
  const msgData = {
    touser: form.reciveOpenid,
    template_id: 'UJIBL-IwXY_7iQC0aQPszUrPw9IZDhzBgmK5GvY5cv4',
    page: pageurl,
    form_id: formId,
    data: {
      keyword1: {
        value: nickname,
      },
      keyword2: {
        value: nowTime,
      },
      keyword3: {
        value: form.goodsName,
      },
      keyword4: {
        value: `${form.payments}元`,
      },
      keyword5: {
        value: `${form.amount}斤`,
      },
    },
    emphasis_keyword: 'keyword3.DATA',
  };
  const token = await getWxToken(ctx, appid, secret);
  const result = await sendTemplateMsg(ctx, token, msgData);
  return result;
}

/**
 * 发送付款模板消息
 * @param {*} ctx 
 * @param {*} appid 
 * @param {*} secret 
 * @param {*} formId 
 * @param {*} nickname 
 * @param {*} form 
 */
async function sendPayMsg(ctx, appid, secret, formId, nickname, form)  {
  const pageurl = `/pages/goods/goods?id=${form._id}&flag=confirm`;
  const nowTime = new Date().toLocaleDateString();
  const remark = `${form.goodsName}:${form.amount}斤的货款`;
  const msgData = {
    touser: form.sendOpenid,
    template_id: 'jzODxJm99F39HfcS1bJsKsDhBoTAjm5bSW7TajA_JFo',
    page: pageurl,
    form_id: formId,
    data: {
      keyword1: {
        value: form.payments,
      },
      keyword2: {
        value: form.paymethod,
      },
      keyword3: {
        value: nowTime,
      },
      keyword4: {
        value: remark,
      },
      keyword5: {
        value: nickname,
      },
    },
    emphasis_keyword: 'keyword1.DATA',
  };
  const token = await getWxToken(ctx, appid, secret);
  const result = await sendTemplateMsg(ctx, token, msgData);
  return result;
}

module.exports = BusinessController;
