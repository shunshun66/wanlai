'use strict';
/**
 * 判断用户角色权限
 * @param {*} options
 */
module.exports = options => {
  return async function hasRole(ctx, next) {
    const req = ctx.req;
    const requireRole = options.role;
    if (requireRole) {
      try {
        const userRole = req.user ? req.user.role : ctx.session.user.role;
        const userRoles = ctx.app.config.userRoles;
        if (userRoles.indexOf(userRole) >= userRoles.indexOf(requireRole)) {
          await next();
        } else {
          ctx.logger.info('权限不正确');
          ctx.status = 403;
        }
      } catch(error) {
        ctx.logger.error(error);
        ctx.status = 403;
      }
    } else {
      ctx.status = 403;
    }
  };
};
