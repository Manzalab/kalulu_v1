 define ([], function () {

    /**
     * This configuration object is used to parameter the minigames using the Detection Signal Theory. 
     * It contains both global and local remediation settings.
    **/

    return {
        baseConfig : { // the "baseConfig" settings are a base to all difficulty levels, overriden by the level specific values.
            generalParameters : { // those will never change after the initial tuning
                gameType                                            : "identification", // "identification", "composition", "pairing", or "other"
                secondsOfPauseAfterCorrectResponse                  : 1,
                secondsOfPauseAfterIncorrectResponse                : 1.5,
                missedCorrectStimuliCountTriggeringPermanentHelp    : 3,
                idleTimeTriggeringPermanentHelp                     : 10, // seconds
                incorrectResponseCountTriggeringFirstRemediation    : 1,
                incorrectResponseCountTriggeringSecondRemediation   : 2,
                lives                                               : 3,     // at the time when lives reach 0 the game ends, i.e. at the third incorrect response for 3 lives
                capitalLettersShare                                 : 0.4,
                boxColliderSize                                     : 1,     // NOT IMPLEMENTED
                lettersSize                                         : 1,     // NOT IMPLEMENTED
                crabAppearanceAnimDuration                          : 0.5,
                crabDisappearanceAnimDuration                       : 0.5,
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
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                totalTriesCount                 : 0,            // something having to do with the UI score bar
                holesCount                      : 0             // the number of columns on which jellyfishes will spawn
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                apparitionsDuration             : {min : 0, max : 0},
                maxCrabsOnScreen                : {min : 0, max : 0},
                minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, 
                maximumCorrectStimuliOnScreen   : {min : 0, max : 0},
                respawnTime                     : {min : 0, max : 0},
                mathsAlternativePercentage      : {min : 0, max : 0},
                mathsAlternativePicturePercentage : {min : 0, max : 0}
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 4,
                    stepDistracterCount             : 3,
                    totalTriesCount                 : 3,
                    holesCount                      : 3
                },
                localRemediation : {
                    apparitionsDuration             : {min : 2.5, max : 3},
                    maxCrabsOnScreen                : {min : 1, max : 2},
                    minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, 
                    maximumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    respawnTime                     : {min : 2, max : 1.5},
                    mathsAlternativePercentage      : {min : 0, max : 0},
                    mathsAlternativePicturePercentage : {min : 1, max : 1}
                }
            },
            { // LEVEL 2
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 6,
                    stepDistracterCount             : 4,
                    totalTriesCount                 : 3,
                    holesCount                      : 5
                },
                localRemediation : {
                    apparitionsDuration             : {min : 2, max : 2.5},
                    maxCrabsOnScreen                : {min : 2, max : 3},
                    minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, 
                    maximumCorrectStimuliOnScreen   : {min : 1, max : 1},
                    respawnTime                     : {min : 1.5, max : 1},
                    mathsAlternativePercentage      : {min : 0, max : 0.2},
                    mathsAlternativePicturePercentage : {min : 1, max : 0.8}
                }
            },
            { // LEVEL 3
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 8,
                    stepDistracterCount             : 7,
                    totalTriesCount                 : 3,
                    holesCount                      : 7
                },
                localRemediation : {
                    apparitionsDuration             : {min : 2, max : 2.5},
                    maxCrabsOnScreen                : {min : 2, max : 3},
                    minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, 
                    maximumCorrectStimuliOnScreen   : {min : 1, max : 2},
                    respawnTime                     : {min : 1, max : 0.8},
                    mathsAlternativePercentage      : {min : 0.2, max : 0.4},
                    mathsAlternativePicturePercentage : {min : 1, max : 0.7}
                }
            }, 
            { // LEVEL 4
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 10,
                    stepDistracterCount             : 7,
                    totalTriesCount                 : 3,
                    holesCount                      : 7
                },
                localRemediation : {
                    apparitionsDuration             : {min : 1.5, max : 2},
                    maxCrabsOnScreen                : {min : 2, max : 4},
                    minimumCorrectStimuliOnScreen   : {min : 0, max : 0}, 
                    maximumCorrectStimuliOnScreen   : {min : 1, max : 2},
                    respawnTime                     : {min : 0.8, max : 0.6},
                    mathsAlternativePercentage      : {min : 0.4, max : 0.5},
                    mathsAlternativePicturePercentage : {min : 0.7, max : 0.5}
                }
            },
            { // LEVEL 5
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 12,
                    stepDistracterCount             : 9,
                    totalTriesCount                 : 3,
                    holesCount                      : 9
                },
                localRemediation : {
                    apparitionsDuration             : {min : 1, max : 1.5},
                    maxCrabsOnScreen                : {min : 3, max : 5},
                    minimumCorrectStimuliOnScreen   : {min : 0, max : 0},
                    maximumCorrectStimuliOnScreen   : {min : 1, max : 3},
                    respawnTime                     : {min : 0.6, max : 0.3},
                    mathsAlternativePercentage      : {min : 0.5, max : 0.7},
                    mathsAlternativePicturePercentage : {min : 0.5, max : 0.3}
                }
            }
        ]
    };
});