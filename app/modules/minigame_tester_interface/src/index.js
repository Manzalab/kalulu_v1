(function () {
    'use strict';

    var MinigameDstRecord  = require ('game_logic/core/minigame_dst_record');
    var StimulusApparition = require ('game_logic/core/stimulus_apparition');
    var Dat                = require ('dat.gui');


    console.info('#######################################\n###### Minigame Tester Interface ######\n#######################################\n');

    console.log();
    console.log(Dat);
    window.dat = Dat;

    var gui = new Dat.GUI();

    var options = {
        MINIGAME    : KALULU_MINIGAME,
        LANGUAGE    : KALULU_LANGUAGE,
        discipline  : 'maths',
        globalLevel : 1,
        localLevel  : 1,
        start       : startGame
    };

    gui.add(options, 'MINIGAME');
    gui.add(options, 'LANGUAGE');
    gui.add(options, 'discipline').listen();
    gui.add(options, 'globalLevel').min(1).max(5).step(1).listen();
    gui.add(options, 'localLevel').min(1).max(5).step(1).listen();
    gui.add(options, 'start');

    function startGame () {
        require.ensure(['phaser-bundle'], function () {
            
            var CrabsLauncher = require ('crabs/src');

            var part1 = options.discipline !== 'language' ? options.discipline : options.LANGUAGE;
            var part2 = '';
            switch (options.MINIGAME) {
                case 'crabs':
                    part2 = 'recognition';
                    break;
                case 'jellyfish':
                    part2 = 'recognition';
                    break;
                default :
                    part2 = 'recognition';
            }
                
            var filename = part1 + "_" + part2;
            console.log(filename);

            options.dummyPedagogicData = require('../assets/data/' + filename + '.json');

            var rafiki = {
                getDifficultyLevel : getDifficultyLevel,
                getPedagogicData   : getPedagogicData,
                save               : save,
                close              : close,
                MinigameDstRecord  : MinigameDstRecord,
                StimulusApparition : StimulusApparition
            };

            var crabsGame = new CrabsLauncher(rafiki);
        });
    }

    function getPedagogicData (params) {
        
        console.info("[DummyRafiki] Received Minigame Params requesting for PedagogicData :"); // TODO update level values depending on results.
        console.log(params);


        console.info("[DummyRafiki] About to send the following pedagogicData in response :");
        console.log(options.dummyPedagogicData);

        return(options.dummyPedagogicData);
    }

    function getDifficultyLevel () {
        
        return {
            globalLevel : options.globalLevel,
            localStage : options.localLevel
        };
    }

    function save (record) {
        console.log("Kalulu will now save the Data to Child Profile :");
        console.log(record);
    }

    function close () {
    
    console.log("Game is Finished, Kalulu Will reopen the Lesson Screen Now.");
}
})();