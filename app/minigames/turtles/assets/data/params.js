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
                capitalLettersShare                                 : 0.4
            },
            globalRemediation : {   // the global remediation settings are invariable inside a game but can evolve depending on globalLevel from one game to the next
                gameType                        : "composition", // "identification", "composition", "pairing", or "other"
                gameTimer                       : Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible                : false,        // is this Timer visible ?
                roundTimer                      : Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible               : false,        // is this Timer visible ?
                roundsCount                     : 1,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets     : 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass                : "Word",   // the class of a round Target
                stepTargetClass                 : "GP",   // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay                     : "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                totalTriesCount                 : 0,            // the amount of stimuli to catch to validate the round
                turtlesOnScreen                 : 0            // the number of turtles that the game will tend to generate
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, // if this is not reached, the next turtle spawned will have a correct stimuli
                correctResponsePercentage       : { min: 0, max: 0 }, // if this is not reached, the next turtle spawned will have a correct stimuli
                respawnTime                     : {min : 0, max : 0}, // nb of seconds between turtles spawns
                speed                           : {min : 0, max : 0}  // speed of the turtles.
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 3, //
                    totalTriesCount                 : 5,
                    turtlesOnScreen                 : 2 //
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1}, //
                    correctResponsePercentage       : { min: 0.90, max: 0.75 }, //
                    respawnTime                     : {min : 3, max : 2}, //
                    speed                           : {min : 1.5, max : 2}  //
                }
            },
            { // LEVEL 2
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 4,
                    totalTriesCount                 : 5,
                    turtlesOnScreen                 : 3
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    correctResponsePercentage       : { min: 0.75, max: 0.60 }, //
                    respawnTime                     : {min : 3, max : 2},
                    speed                           : {min : 1.5, max : 2}
                }
            },
            { // LEVEL 3
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 5,
                    totalTriesCount                 : 6,
                    turtlesOnScreen                 : 4
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    correctResponsePercentage       : { min: 0.60, max: 0.45 }, //
                    respawnTime                     : {min : 2, max : 2},
                    speed                           : {min : 2, max : 2.5}
                }
            }, 
            { // LEVEL 4
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 7,
                    totalTriesCount                 : 6,
                    turtlesOnScreen                 : 5
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    correctResponsePercentage       : { min: 0.45, max: 0.30 }, //
                    respawnTime                     : {min : 2, max : 1},
                    speed                           : {min : 2.5, max : 3}
                }
            },
            { // LEVEL 5
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 9,
                    totalTriesCount                 : 7,
                    turtlesOnScreen                 : 5
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    correctResponsePercentage       : { min: 0.30, max: 0.10 }, //
                    respawnTime                     : {min : 1, max : 1},
                    speed                           : {min : 3, max : 4}
                }
            }
        ]
    };
});