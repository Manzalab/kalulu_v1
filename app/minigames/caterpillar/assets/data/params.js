 define ([], function () {

    /**
     * This configuration object is used to parameter the minigames using the Detection Signal Theory. 
     * It contains both global and local remediation settings.
    **/

    return {
        baseConfig : { // the "baseConfig" settings are a base to all difficulty levels, overriden by the level specific values.
            generalParameters : { // those will never change after the initial tuning
                secondsOfPauseAfterCorrectResponse                  : 1,
                secondsOfPauseAfterIncorrectResponse                : 1.5,
                missedCorrectStimuliCountTriggeringPermanentHelp    : 3,
                incorrectResponseCountTriggeringFirstRemediation    : 1,
                incorrectResponseCountTriggeringSecondRemediation   : 2,
                lives                                               : 3,     // at the time when lives reach 0 the game ends, i.e. at the third incorrect response for 3 lives
                capitalLettersShare                                 : 0.4,
                caterpillarSpeed                                    : 30,
                popupTimeOnScreen                                   : 3
            },
            globalRemediation : {   // the global remediation settings are invariable inside a game but can evolve depending on globalLevel from one game to the next
                gameType                        : "composition", // "identification", "composition", "pairing", or "other"
                gameTimer                       : Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible                : false,        // is this Timer visible ?
                roundTimer                      : Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible               : false,        // is this Timer visible ?
                roundsCount                     : 5,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets     : 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass                : "Word",   // the class of a round Target
                stepTargetClass                 : "GP",   // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay                     : "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                lineCount                       : 0,             // the number of columns on which jellyfishes will spawn
                berriesOnScreen                 : 0,
                totalTriesCount                 : 0
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                minimumCorrectStimuliOnScreen   : { min: 0, max: 0 }, // if this is not reached, the next Jellyfish spawned will have a correct stimuli
                correctResponsePercentage       : { min: 0, max: 0 }, // if this is not reached, the next Jellyfish spawned will have a correct stimuli
                berryPerLine                    : { min: 0, max: 0 }, // if this is reached, the next Jellyfish spawned will have an incorrect stimuli
                respawnTime                     : {min : 0, max : 0}, // nb of seconds between jellyfishes spawns
                speed                           : { min: 0, max: 0 },  // speed of the jellyfishes.
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    stepDistracterCount             : 3, //
                    roundsCount                     : 3, //
                    lineCount                       : 3,
                    berriesOnScreen                 : 2,
                    totalTriesCount                 : 3
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 2, max : 1}, //
                    correctResponsePercentage       : { min: 0.90, max: 0.75 }, //
                    berryPerLine                    : { min: 0, max: 1 }, 
                    respawnTime                     : {min : 3, max : 2.5}, //
                    speed                           : {min : 5, max : 5.5},  //
                }
            },
            { // LEVEL 2
                globalRemediation: {
                   stepDistracterCount             : 3, //
                   roundsCount                     : 3, //
                   lineCount                       : 3,
                   berriesOnScreen                 : 2,
                   totalTriesCount                 : 3
                },
                localRemediation: {
                    minimumCorrectStimuliOnScreen   : {min : 2, max : 1}, //
                    correctResponsePercentage       : { min: 0.75, max: 0.60 }, //
                    berryPerLine                    : { min: 0, max: 1 }, 
                    respawnTime                     : {min : 3, max : 2.5}, //
                    speed                           : {min : 5.5, max : 6},  //
                }
            },
            { // LEVEL 3
                globalRemediation: {
                   stepDistracterCount             : 3, //
                   roundsCount                     : 4, //
                   lineCount                       : 4,
                   berriesOnScreen                 : 3,
                   totalTriesCount                 : 3
                },
                localRemediation: {
                    minimumCorrectStimuliOnScreen   : {min : 2, max : 1}, //
                    correctResponsePercentage       : { min: 0.60, max: 0.45 }, //
                    berryPerLine                    : { min: 0, max: 2 }, 
                    respawnTime                     : {min : 2.5, max : 2}, //
                    speed                           : {min : 6, max : 7},  //
                }
            }, 
            { // LEVEL 4
                 globalRemediation: {
                   stepDistracterCount             : 3, //
                   roundsCount                     : 5, //
                   lineCount                       : 4,
                   berriesOnScreen                 : 4,
                   totalTriesCount                 : 3
                },
                localRemediation: {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1}, //
                    correctResponsePercentage       : { min: 0.45, max: 0.30 }, //
                    berryPerLine                    : { min: 0, max: 2 }, 
                    respawnTime                     : {min : 2, max : 1.5}, //
                    speed                           : {min : 7.5, max : 8},  //
                }
            },
            { // LEVEL 5
                globalRemediation: {
                   stepDistracterCount             : 3, //
                   roundsCount                     : 5, //
                   lineCount                       : 5,
                   berriesOnScreen                 : 5,
                   totalTriesCount                 : 3
                },
                localRemediation: {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1}, //
                    correctResponsePercentage       : { min: 0.30, max: 0.10 }, //
                    berryPerLine                    : { min: 0, max: 3 }, 
                    respawnTime                     : {min : 1.5, max : 1}, //
                    speed                           : {min : 8, max : 8.5},  //
                }
            }
        ]
    };
});