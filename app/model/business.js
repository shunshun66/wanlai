'use strict';
/**
 *
 * @param {*往来货物信息表} app
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const BusinessSchema = new mongoose.Schema({
    goodsName: String,          // 货物名称
    prices: Number,             // 单价
    amount: Number,             // 数量
    payments: Number,           // 货款
    sendOpenid: String,         // 发货人的openid
    reciveOpenid: String,       // 收货人的openid
    sendName: String,           // 发货人的昵称
    reciveName: String,         // 收货人的昵称
    sendDate: Date,             // 发货时间
    reciveDate: Date,           // 收货时间
    payMoneyDate: Date,         // 付款时间
    reciveMoneyDate: Date,      // 收款时间
    status: String,             // 货物往来状态：1：发货 2：确认收货 3：付款 4：收款
    paymethod: String,          // 支付方式
  }, {
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'update_time',
    },
  });

  return mongoose.model('Business', BusinessSchema);
};
