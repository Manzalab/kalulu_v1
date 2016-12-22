function audio(game, config){
  var sounds = './assets/sounds/';
  for(var i in config){
    game.load.audio(i, [sounds+config[i]]);
  }
}
module.exports = audio;
