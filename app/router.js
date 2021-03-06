'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {
    router,
    controller,
    io,
  } = app;
  router.get('/', controller.home.index);
  /** 用户管理路由 */
  router.resources('users', '/api/user', controller.user);
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/wxlogin', controller.user.wxlogin);
  router.put('/api/user/:id/password', controller.user.changPasswd);
  router.get('/api/user/me', controller.user.me);
  router.get('/api/user/getall', controller.user.getAll);
  router.get('/api/user/getUsers', controller.user.getUsers);

  /** 图片素材管理路由 */
  router.get('/api/imgmng', controller.imgmng.index);
  router.post('/api/imgmng/imgupload', controller.imgmng.imgUpload);
  router.put('/api/imgmng/delimg', controller.imgmng.delImg);
  /** 广告图片 */
  router.resources('banner', '/api/banner', controller.banner);
  router.get('/api/banner/getbannerById', controller.banner.getBannerById);
  router.get('/api/banner/getAdvert', controller.banner.getAdvert);
  /** 交易路由 */
  router.resources('business', '/api/business', controller.business);
  router.get('/api/business/getGoodsOfSender', controller.business.getGoodsOfSender);
  router.get('/api/business/getAllGoodsOfSender', controller.business.getAllGoodsOfSender);
  router.get('/api/business/getGoodsOfReceive', controller.business.getGoodsOfReceive);
  router.get('/api/business/getAllGoodsOfReceive', controller.business.getAllGoodsOfReceive);
  router.get('/api/business/getSumPayOfReceive', controller.business.getSumPayOfReceive);
  router.get('/api/business/getSumPayOfSender', controller.business.getSumPayOfSender);
  router.get('/api/business/getGoodsById', controller.business.getGoodsById);
  router.get('/api/business/getPayGoodsOfSender', controller.business.getPayGoodsOfSender);
  router.get('/api/business/getTotalMoneyOfReceive', controller.business.getTotalMoneyOfReceive);
  router.get('/api/business/getTotalMoneyOfSender', controller.business.getTotalMoneyOfSender);
  /** 客户管理路由 */
  router.resources('myuser', '/api/myuser', controller.myuser);
  router.get('/api/myuser', controller.myuser.index);
  router.get('/api/myuser/findByName', controller.myuser.findByName);
  router.get('/api/myuser/getMyuserBypage', controller.myuser.getMyuserBypage);
  /** formids的路由 */
  router.post('/api/formids/saveFormids', controller.formids.SaveFormids);
  /** websocket 路由 */
  io.of('/').route('exchange', io.controller.nsp.exchange);
};
