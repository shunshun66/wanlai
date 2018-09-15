'use strict';
const path = require('path')
module.exports = appInfo => {
    const config = exports = {};
    config.logger = {
        level: 'INFO',
        consoleLevel: 'NONE',
        dir: path.join(appInfo.root, '/logs')
    };
    
    return config;
};
