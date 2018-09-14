'use strict';
/**
 * 我的客户
 * @param {*} app 
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const MyuserSchema = new mongoose.Schema({
    name: String, // 用户昵称
    weixin_openid: String, // 用户微信ID
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

  /**
   * Pre-save hook
   */
  MyuserSchema
    .pre('save', function (next) {
      if (!this.isNew) return next();

      const self = this;
      this.constructor.findOne({
        weixin_openid: this.weixin_openid,
        userID: this.userID,
      }, function(err, user) {
        if (err) {
          return next(new Error('查找我的客户信息失败'));
        }
        if (user) {
          if (self._id === user._id) {
            return next();
          }
          return next(new Error('我的客户信息已存在'));
        }
        return next();
      });
    });
  return mongoose.model('Myuser', MyuserSchema);
};
