'use strict';
/**
 *
 * @param {*收到的模板消息表} app
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const MessageSchema = new mongoose.Schema({
    goodsId: String,            // 货物ID
    msgType: String,            // 消息类型   1：发货确认消息 2: 付款确认消息
    msg: String,                // 消息内容
    sendOpenid: String,         // 发消息人的openid
    reciveOpenid: String,       // 收消息人的openid
  }, {
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'update_time',
    },
  });

  return mongoose.model('Message', MessageSchema);
};
