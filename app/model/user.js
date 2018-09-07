'use strict';
const crypto = require('crypto');
/**
 *
 * @param {*用户信息表} app
 */
module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    name: String,
    weixin_openid: String,
    username: {
      type: String,
      lowercase: true,
    },
    role: {
      type: String,
      default: 'guest',
    },
    hashedPassword: String,
    email: String,
    mobileTel: String,
    avatar: String, // 头像
    gender: String, // 性别 0：未知、1：男、2：女
    companyName: String, // 企业名称
    address: String, // 地理位置
    longitude: Number,
    latitude: Number,
    salt: String, // 生成token的密钥
  }, {
    timestamps: {
      createdAt: 'created_time',
      updatedAt: 'update_time',
    },
  });
    /**
     * Virtuals
     */
  UserSchema
    .virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
      return this._password;
    });

  // Public profile information
  UserSchema
    .virtual('profile')
    .get(function() {
      return {
        name: this.name,
        role: this.role,
      };
    });
   
  // Validate empty username
  UserSchema
    .path('username')
    .validate(function(username) {
      return username.length;
    }, 'Username cannot be blank');

  // Validate empty password
  UserSchema
    .path('hashedPassword')
    .validate(function(hashedPassword) {
      return hashedPassword.length;
    }, 'Password cannot be blank');

  // Validate username is not taken
  UserSchema
    .path('username')
    .validate(function(value) {
      const self = this;
      this.constructor.findOne({
        username: value,
      }, function(err, user) {
        if (err) throw err;
        if (user) {
          if (self.id === user.id) return true;
          return false;
        }
        return true;
      });
    }, 'The specified username is already in use.');

  const validatePresenceOf = function(value) {
    return value && value.length;
  };

    /**
     * Pre-save hook
     */
  UserSchema
    .pre('save', function(next) {
      if (!this.isNew) return next();

      if (!validatePresenceOf(this.hashedPassword)) {
        next(new Error('Invalid password'));
      } else {
        next();
      }
    });

  /**
     * Methods
     */
  UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
    */
    authenticate(plainText) {
      return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
    */
    makeSalt() {
      return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
    */
    encryptPassword(password) {
      if (!password || !this.salt) return '';
      const salt = new Buffer(this.salt, 'base64');
      return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
    },
  };

  return mongoose.model('User', UserSchema);
};
