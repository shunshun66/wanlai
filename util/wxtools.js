'use strict';
/**
 * 获取微信的access_token
 * @param {*} ctx
 * @param {*} appid 
 * @param {*} appsecret 
 */
let access_token = null;
const getWxToken = async (ctx, appid, appsecret) => {
  if (access_token) {
    return access_token;
  }
  const wxurl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
  const wxResult = await ctx.curl(wxurl,  { dataType: 'json' });
  if (wxResult.data.errcode) {
    ctx.logger.error(wxResult.data.errmsg);
    return null;
  }
  access_token = wxResult.data.access_token;
  setTimeout(function() {
    access_token = null;
  }, wxResult.data.expires_in * 1000);
  return access_token;
};

/**
 * 发送模板消息
 * @param {*} ctx
 * @param {*} token 
 * @param {*} msgData 
 */
const sendTemplateMsg = async (ctx, token, msgData) => {
  const wxurl = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${token}`;
  const result = await ctx.curl(wxurl, {
    method: 'POST',
    contentType: 'json',
    data: msgData,
    dataType: 'json',
  });
  if (result.data.errcode) {
    ctx.logger.error(result.data.errmsg);
    return false;
  }
  ctx.logger.info(`template_id:${result.data.template_id}`);
  return true;
};

module.exports = {
  getWxToken,
  sendTemplateMsg,
};
