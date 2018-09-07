'use strict';
/**
 * 图像文件管理表
 * @param {*} app 
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const ImgmngSchema = new mongoose.Schema({
    imgUrl: String, // 图片的URL
    imgPath: String, // 图片保存的物理地址
    minImgUrl: String, // 小图片的URL
    minImgPath: String, // 小图片保存的物理地址
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

  return mongoose.model('Imgmng', ImgmngSchema);
};
