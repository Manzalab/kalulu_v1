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
                jellyfishesMinimumSize                              : 50,
                jellyfishesMaximumSize                              : 80,
                lives                                               : 3,     // at the time when lives reach 0 the game ends, i.e. at the third incorrect response for 3 lives
                capitalLettersShare                                 : 0.4
            },
            globalRemediation : {   // the global remediation settings are invariable inside a game but can evolve depending on globalLevel from one game to the next
                gameType                        : "identification", // "identification", "composition", "pairing", or "other"
                gameTimer                       : Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible                : false,        // is this Timer visible ?
                roundTimer                      : Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible               : false,        // is this Timer visible ?
                roundsCount                     : 1,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets     : 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass                : "Syllable",   // the class of a round Target
                stepTargetClass                 : "Syllable",   // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay                     : "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                totalTriesCount                 : 0,            // the amount of stimuli to catch to validate the round
                jellyfishesOnScreen             : 0,            // the number of jellyfishes that the game will tend to generate
                columnCount                     : 0             // the number of columns on which jellyfishes will spawn
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, // if this is not reached, the next Jellyfish spawned will have a correct stimuli
                maximumCorrectStimuliOnScreen   : {min : 0, max : 0}, // if this is reached, the next Jellyfish spawned will have an incorrect stimuli
                respawnTime                     : {min : 0, max : 0}, // nb of seconds between jellyfishes spawns
                speed                           : {min : 0, max : 0}  // speed of the jellyfishes.
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 3, //
                    totalTriesCount                 : 4, //
                    jellyfishesOnScreen             : 4, //
                    columnCount                     : 2  //
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 3, max : 2}, //
                    maximumCorrectStimuliOnScreen   : {min : 4, max : 3}, //
                    respawnTime                     : {min : 4, max : 3}, //
                    speed                           : {min : 2, max : 4}  //
                }
            },
            { // LEVEL 2
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 4,
                    totalTriesCount                 : 6,
                    jellyfishesOnScreen             : 5,
                    columnCount                     : 2
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 2, max : 1},
                    maximumCorrectStimuliOnScreen   : {min : 3, max : 2},
                    respawnTime                     : {min : 3.5, max : 2.5},
                    speed                           : {min : 4, max : 6}
                }
            },
            { // LEVEL 3
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 5,
                    totalTriesCount                 : 8,
                    jellyfishesOnScreen             : 6,
                    columnCount                     : 3
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 2, max : 1},
                    maximumCorrectStimuliOnScreen   : {min : 3, max : 1},
                    respawnTime                     : {min : 2, max : 1},
                    speed                           : {min : 5, max : 10}
                }
            }, 
            { // LEVEL 4
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 7,
                    totalTriesCount                 : 10,
                    jellyfishesOnScreen             : 8,
                    columnCount                     : 4
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 3, max : 1},
                    maximumCorrectStimuliOnScreen   : {min : 5, max : 3},
                    respawnTime                     : {min : 2.5, max : 1.5},
                    speed                           : {min : 6, max : 8}
                }
            },
            { // LEVEL 5
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    stepDistracterCount             : 9,
                    totalTriesCount                 : 12,
                    jellyfishesOnScreen             : 10,
                    columnCount                     : 5
                },
                localRemediation : {
                    minimumCorrectStimuliOnScreen   : {min : 4, max : 1},
                    maximumCorrectStimuliOnScreen   : {min : 6, max : 4},
                    respawnTime                     : {min : 2, max : 1},
                    speed                           : {min : 8, max : 10}
                }
            }
        ]
    };
});