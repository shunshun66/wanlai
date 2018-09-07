'use strict';

const Controller = require('egg').Controller;
// 测试数据
const banners = [
  {
    "imgUrl": "/static/uploads/fEtHgJLA9SY48S0xYrxDCjecSlz8Lb91536205434000.jpg",
    "link": "www.baidu.com",
  },
  {
    "imgUrl": "/static/uploads/IAseQWLcqPL4fOzmD1FEbsvSl0Gu1536205686000.jpg",
    "link": "www.baidu.com",
  },
  {
    "imgUrl": "/static/uploads/eIKdEXwide6eXjZtufPfRrdhHCPvchUIq2IGQTTFA5Un3SBxqLOUt2tHb88AK8NwRoNCcGO9IIHyDUNsHoA4PLsIUILuIcsyk1536205721000.jpg",
    "link": "www.baidu.com",
  },
];
class BannerController extends Controller {
  async index() {
    const { ctx } = this;
    try {
      // ctx.body = await ctx.model.Banner.find();
      // 测试
      ctx.body = banners;
    } catch (err) {
      ctx.logger.error(err);
      ctx.body = { err: '获取广告图片失败' };
    }
  }
}

module.exports = BannerController;
