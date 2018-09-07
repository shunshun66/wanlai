'use strict';

/**
 * 图片信息管理服务类
 */
const Service = require('egg').Service;
const tools = require('../../util/tools');
const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const sendToWormhole = require('stream-wormhole');
const awaitWriteStream = require('await-stream-ready').write;
class ImgmngService extends Service {
  /**
   * 获取用户的图片素材
   */
  async getImgs() {
    const ctx = this.ctx;
    try {
      const id = ctx.session.user ? ctx.session.user._id : ctx.req.user._id;
      const imgs = await ctx.model.Imgmng.find({
        userID: id,
      })
      return imgs;
    } catch (err) {
      ctx.logger.error(err);
      ctx.throw(500, '获取图片素材发生错误');
    }
  }

  /**
   * 上传文件
   */
  async imgUpload() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    const fileName = path.basename(stream.filename);
    try {
      const filenewname = tools.randFilename(fileName);
      const uploadsPath = ctx.app.config.uploads;
      const filenewpath = path.join(uploadsPath, filenewname);
      const fileUrl = '/static/uploads/' + filenewname;
      // 保存文件
      const writeStream = fs.createWriteStream(filenewpath);
      await awaitWriteStream(stream.pipe(writeStream));

      const imgInfo = {};
      imgInfo['imgUrl'] = fileUrl;
      imgInfo['imgPath'] = filenewpath;
      imgInfo['imgName'] = fileName;
      imgInfo['userID'] = ctx.session.user ? ctx.session.user._id : ctx.req.user._id;
      const fileExt = tools.getFilenameExt(fileName);
      if (fileExt === 'jpg' || fileExt === 'png') {
        // 图片的宽度大于200PX时，压缩图片
        const minFileName = 'min_' + filenewname;
        const mingFilePath = path.join(uploadsPath, minFileName);
        jimp.read(filenewpath)
          .then(lenna => {
            lenna.resize(200, jimp.AUTO)
              .getBuffer(jimp.AUTO, (err, buffer) => {
                if (!err) {
                  fs.writeFile(mingFilePath, buffer);
                }

              });
            // .write(mingFilePath)
          }).catch(err => {
            ctx.logger.error(err);
          })
        imgInfo['minImgUrl'] = '/static/uploads/' + minFileName;
        imgInfo['minImgPath'] = mingFilePath;
      }
      const imgData = await ctx.model.Imgmng.create(imgInfo);
      return imgData;
    } catch (err) {
      ctx.logger.error(err)
      await sendToWormhole(stream);
      ctx.throw(400, '文件上传失败');
    }
  }

  async delImg() {
    const ctx = this.ctx;
    const delImgid = ctx.request.body.img_id;
    try {
      const imgData = await ctx.model.Imgmng.findByIdAndRemove(delImgid);
      if (imgData && imgData.imgPath && fs.existsSync(imgData.imgPath)) {
        // 物理删除图片文件
        await fs.unlink(imgData.imgPath);
        // 删除小图片
        if (imgData.minImgPath && fs.existsSync(imgData.minImgPath)) {
          await fs.unlink(imgData.minImgPath);
        }
      }
      return imgData;
    } catch (err) {
      ctx.logger.error(err);
    }
  }

}

module.exports = ImgmngService;
