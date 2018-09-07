'use strict';
/**
 * 广告图像管理表
 * @param {*} app 
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const BannerSchema = new mongoose.Schema({
    imgUrl: String, // 图片的URL
    minImgUrl: String, // 小图片的URL
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
