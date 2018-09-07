'use strict';

const Controller = require('egg').Controller;

class ImgmngController extends Controller {
  async index() {
    const { ctx } = this;
    const imgs = await ctx.service.imgmng.getImgs();
    if (!imgs) {
      ctx.status = 404;
    }
    ctx.body = {
      results: imgs,
    };
  }

  async imgUpload() {
    const { ctx } = this;
    const imgdata = await ctx.service.imgmng.imgUpload();
    ctx.body = {
      results: imgdata,
    };
  }

  async delImg() {
    const { ctx } = this;
    const imgdata = await ctx.service.imgmng.delImg();
    ctx.body = {
      results: imgdata,
    };
  }
}

module.exports = ImgmngController;
