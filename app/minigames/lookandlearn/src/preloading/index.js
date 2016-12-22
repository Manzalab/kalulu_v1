function preload(context, game, config){
  require('./audio')(game, config.audio);
}

module.exports = preload;
