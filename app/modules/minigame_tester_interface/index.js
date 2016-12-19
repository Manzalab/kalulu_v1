(function () {
    'use strict';

    var MinigameDstRecord  = require ('game_logic/core/minigame_dst_record');
    var StimulusApparition = require ('game_logic/core/stimulus_apparition');

    console.info('###################################\n#### Minigame Tester Interface ####\n###################################\n');

    require.ensure(['phaser-bundle'], function () {

        var CrabsLauncher = require ('crabs/src');

        // var demoData = Config.demoData;

        var rafiki = {
            getDifficultyLevel : getDifficultyLevel,
            getPedagogicData   : getPedagogicData,
            save               : save,
            close              : close,
            MinigameDstRecord  : MinigameDstRecord,
            StimulusApparition : StimulusApparition,
        };

        var crabsGame = new CrabsLauncher(rafiki);
    });

})();


function getPedagogicData (params) {
    
    console.log("Required Parameters for Global Remediation :"); // TODO update level values depending on results.
    console.log(params);
    console.log("Setup Data :");

    if (Config.discipline != "maths") {
        console.log(dummyData);
        return dummyData;
    }
    else {
        console.log(dummyDataMaths);
        return dummyDataMaths;
    }     
};

function getDifficultyLevel () {
    
    return {
        globalLevel : 3,
        localStage : 3
    };
};

function save (record) {
    console.log("Kalulu will now save the Data to Child Profile :");
    console.log(record);
};

function close () {
    
    console.log("Game is Finished, Kalulu Will reopen the Lesson Screen Now.");
};

// "datgui"
// "standalone_dummy_data"
// "standalone_dummy_data_maths"

// dat
// dummyData
// dummyDataMaths