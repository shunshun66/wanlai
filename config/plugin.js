'use strict';

// had enabled by egg
// exports.static = true;
exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};
exports.redis = {
  enable: true,
  package: 'egg-redis',
};
