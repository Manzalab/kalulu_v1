var BotCanvasLayout    = require('../layouts/bot-canvas');
var PlayerCanvasLayout = require('../layouts/player-canvas');
var DebugLayout        = require('../layouts/debug-layout');

function layoutsLoader(game, config, options){

    options = typeof options === 'undefined' ? {} : options;
    options.isBotOn = typeof options.isBotOn === 'undefined' ? false : options.isBotOn;
    options.isPlayerOn = typeof options.isPlayerOn === 'undefined' ? false : options.isPlayerOn;
    options.isDebugOn = typeof options.isDebugOn === 'undefined' ? false : options.isDebugOn;
    options.isPhaseOne = typeof options.isPhaseOne === 'undefined' ? false : options.isPhaseOne;

    // console.log('Loading the layouts');

    var layouts = [];
    
    if (options.isBotOn) {
        layouts.push(new BotCanvasLayout(game, config.layouts.botLayout));
        // console.log('Loading the layout Bot');
    }
    if (options.isPhaseOne) {
        layouts.push(new BotCanvasLayout(game, config.layouts.tracerBotLayout));
        layouts.push(new BotCanvasLayout(game, config.layouts.phase1Lowercase));
        // console.log('Loading the layout PhaseOne');
    }
    if (options.isPlayerOn) {
        layouts.push(new BotCanvasLayout(game, config.layouts.calcLayout));
        layouts.push(new PlayerCanvasLayout(game, config.layouts.playerLayout));        
        // console.log('Loading the layout Player');
    }

    if (options.isDebugOn) {
        layouts.push(new DebugLayout(game, config.layouts.debugLayout));
        // console.log('Loading the layout Debug');
    }

    // console.log('End loading the layouts');

    game.layouts = layouts;
}

module.exports = layoutsLoader;
