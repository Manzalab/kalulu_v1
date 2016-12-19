var path = require('path');
var webpack = require('webpack');

module.exports = {

    contentBase : path.resolve(__dirname, '../www'),

    publicPath: "/",

    hot : true,

    stats: { colors: true },
};