(function() {

    'use strict';

    var names = {
        BOOT               : "Boot",
        PRELOAD            : "Preload",
        BOARD_GAME_PHASE   : "BoardGamePhase",
        VIDEO_PHASE        : "VideoPhase",
        ILLUSTRATION_PHASE : "IllustrationPhase",
        TRACING_PHASE      : "TracingPhase"
    };

    var states = {};
    states[names.BOOT]               = require('./boot');
    states[names.PRELOAD]            = require('./preload');
    states[names.BOARD_GAME_PHASE]   = require('./phase_board_game');
    states[names.VIDEO_PHASE]        = require('./phase_video');
    states[names.ILLUSTRATION_PHASE] = require('./phase_illustration');
    states[names.TRACING_PHASE]      = require('./phase_tracing');

    module.exports = {
        names  : names,
        states : states
    };

})();
