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
                gameType                        : "pairing", // "identification", "composition", "pairing", or "other"
                gameTimer                       : Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible                : false,        // is this Timer visible ?
                roundTimer                      : Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible               : false,        // is this Timer visible ?
                roundsCount                     : 1,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets     : 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass                : "GP",         // the class of a round Target
                stepTargetClass                 : "GP",         // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay                     : "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                parakeetPairs                   : 0,            // the number of jellyfishes that the game will tend to generate
                branchesCount                   : 0             // the number of columns on which jellyfishes will spawn
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                showTime                        : {min : 0, max : 0},  // speed of the jellyfishes.
                
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    parakeetPairs                   : 2, //
                    branchesCount                   : 2  //

                },
                localRemediation : {
                    showTime                        : {min : 3, max : 2}, //
                    
                }
            },
            { // LEVEL 2
                 globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    parakeetPairs                   : 3, //
                    branchesCount                   : 2  //
                },
                localRemediation : {
                    showTime                        : {min : 3, max : 2}, //
                    
                }
            },
            { // LEVEL 3
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    parakeetPairs                   : 3, //
                    branchesCount                   : 2  //
                },
                localRemediation : {
                    showTime                        : {min : 2, max : 1.5}, //
                   
                }
            }, 
            { // LEVEL 4
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    parakeetPairs                   : 4, //
                    branchesCount                   : 4  //
                },
                localRemediation : {
                    showTime                        : {min : 1.5, max : 1}, //
                    
                }
            },
            { // LEVEL 5
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    parakeetPairs                   : 4, //
                    branchesCount                   : 4  //
                },
                localRemediation : {
                    showTime                        : {min : 1.5, max : 1}, //
                   
                }
            }
        ]
    };
});