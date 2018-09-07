'use strict';
/**
 *
 * @param {*账本统计信息表} app
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const MybillSchema = new mongoose.Schema({
    userID: {                   // 所属用户
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    tradeID: {                  // 交易客户ID
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    tradeDate: Date,           // 交易时间
    type: String,               // 交易类型：3：付款 4：收款
  }, {
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'update_time',
    },
  });

  return mongoose.model('Mybill', MybillSchema);
};
