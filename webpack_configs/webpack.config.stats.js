var components = require('./components.webpack.config.js');
var build = require('./webpack.config.build.js');

build.profile = true;
console.log(build);
module.exports = build;

// console.log('\n Stats :');
// console.log(module.exports);