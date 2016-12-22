var Phaser = require('phaser-bundle');

function gameCreator(preload, create, loop, config, endFunction){
	
    console.log('Creating Game object...');

    var game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'LettersTracing', {
    	preload: function(game){
    		preload(this, game, config)
    	},
    	create: function(game){
    		create(this, game, config)
    	},
    	render: loop 
    });

    console.log('End creating Game Object');

    game.config = config;
    game.end = endFunction;
    console.log(config);
    Emitter.emit(Events.GAME_LAUNCHED);

    return game;
}

module.exports = gameCreator;