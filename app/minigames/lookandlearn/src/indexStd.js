var configurator = require('./config');

/**
 * @param config      {object}    a list of options { layouts (the tracing layouts), progression (letters-descriptor), game (now empty), audio (the list of sounds) }
 * @param params      {object}    a list of characters to trace { 'A' : {nbOfTimes : 2 }, ... }
 * @param endFunction {function}  a function that will be called at end of game (maybe useless)
**/
function start(config, params, endFunction){
  config.applicationParameters = params;
  //Preloading script
  var preload = require('./preloading');

  //create script (start of the game)
  var create = require('./create');

  //The main loop function
  var loop = require('./loop');

  //bootinh the game
  var game = require('./game')(preload, create, loop, config, endFunction);
}

function App(params, endFunction){
  //fake data
  var fake = {
    'A': {
      nbOfTimes: 2
    },
    'a': {
      nbOfTimes: 2
    },
    'B': {
      nbOfTimes: 2
    },
    'b': {
      nbOfTimes: 2
    }
  };

  configurator(
    start,
    params || fake,
    endFunction || function(){/*console.log("NO END FUNCTION SET")*/}
  );
};

module.exports = App;

//to remove to make it work in integrated mode
App();
