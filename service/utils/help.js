const path = require('path');

module.exports = {
    getDataPath() {
        return path.join(process.env.ProgramData || 'C:/ProgramData', '/', 'GenerateTool', '/').replace(/\\/g, '\/');
    },
    getPid() {
        const history = require('../dao/history');
        return history.getMode()
    }
};
