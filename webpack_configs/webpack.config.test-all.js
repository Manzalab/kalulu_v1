var components = require('./components.webpack.config.js');
var build      = require('./webpack.config.build.js');

console.log(components.mergeConfigs);
module.exports = components.mergeConfigs(
    build,
    components.getHMR()
);

console.log('\n Test All :');
console.log(module.exports);