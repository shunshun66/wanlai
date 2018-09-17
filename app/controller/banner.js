'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
const { listQuery } = require('../common/paging');

class BannerController extends Controller {
  async index() {
    const { ctx } = this;
    let page = ctx.query.page || { current: 1, limit: 10 };

    try {
      if (typeof page === 'string') {
        page = JSON.parse(page);
      }
      let search = {};
      const value = ctx.query.value;
      if (value) {
        const strValue = new RegExp(value);
        const subsql = { name: strValue };
        search = _.merge(search, subsql);
      }
      ctx.body = await listQuery(ctx.model.Banner, search, '', 'imgIndex', page);
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取广告图片失败' };
    }
  }

  /**
   * 获取显示的广告图片
   */
  async getAdvert() {
    const { ctx } = this;
    try {
      const type = ctx.query.imgtype || 'advert';
      ctx.body = await ctx.model.Banner.find({ imgType: type }).sort('imgIndex');
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取广告图片失败' };
    }
  }

  async getBannerById() {
    const { ctx } = this;
    try {
      const id = ctx.params.id;
      ctx.body = await ctx.model.Banner.findById(id);
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取广告图片失败' };
    }
  }
  /**
   * 创建广告图片
   */
  async create() {
    const {
      ctx,
    } = this;
    const user = ctx.session.user || ctx.request.user;
    const form = ctx.request.body;
    form.userID = user._id;
    const banner = new ctx.model.Banner(form);
    try {
      ctx.body = await banner.save();
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = {
        err: '创建广告图片失败',
      };
    }
  }

  /**
   * 修改广告图片
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
      const bannerInfo = await this.ctx.model.Banner.findById(ctx.params.id);
      if (!bannerInfo) {
        ctx.logger.error('广告信息不存在');
        ctx.body = { err: '广告信息不存在' };
        return;
      }
      const updated = _.assign(bannerInfo, form);
      const newBanner = await updated.save();
      ctx.body = newBanner;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '广告信息更新失败' };
    }
  }

  /**
   * 删除广告图片
   */
  async destroy() {
    const {
      ctx,
    } = this;
    try {
      ctx.body = await ctx.model.Banner.findByIdAndRemove(this.ctx.params.id);
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '删除广告信息失败' };
    }
  }
}

module.exports = BannerController;
