'use strict';
/**
 * 广告图像管理表
 * @param {*} app 
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const BannerSchema = new mongoose.Schema({
    imgUrl: String,       // 图片的URL
    minImgUrl: String,    // 小图片的URL
    imgName: String,      // 图片名称
    imgIndex: String,     // 图片序号
    imgType: String,      // 图片类型
    positionType: String, // 图片位置类型
    linkUrl: String,      // 连接地址
    userID: { // 所属用户
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  }, {
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'update_time',
    },
  });

  return mongoose.model('Banner', BannerSchema);
};
