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
                gameType                        : "filling", // "identification", "composition", "pairing", or "other"
                gameTimer                       : Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible                : false,        // is this Timer visible ?
                roundTimer                      : Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible               : false,        // is this Timer visible ?
                roundsCount                     : 3,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets     : 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass                : "Sentence",   // the class of a round Target
                stepTargetClass                 : "Sentence",   // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay                     : "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                stepDistracterCount             : 0,            // the amount of distracter stimuli to be provided by Rafiki for each round.
                totalTriesCount                 : 0,            // the amount of stimuli to catch to validate the round
            },
            localRemediation : { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
                sentencesCount   : {min : 1, max : 1}, // number of sentences on screen
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation : {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 3,   
                    totalTriesCount                 : 3,
                },
                localRemediation : {
                    sentencesCount                  : { min: 2, max: 2 }
                }
            },
            { // LEVEL 2
                globalRemediation: {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 4,
                    totalTriesCount                 : 4,
                },
                localRemediation: {
                    sentencesCount                  : { min: 2, max: 2 }
                }
            },
            { // LEVEL 3
                globalRemediation: {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 5,
                    totalTriesCount                 : 5,

                },
                localRemediation: {
                    sentencesCount                  : { min: 3, max: 3 }
                }
            },
            { // LEVEL 4
                globalRemediation: {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 6,
                    totalTriesCount                 : 6,

                },
                localRemediation: {
                    sentencesCount                  : { min: 3, max: 3 }
                }
            },
            { // LEVEL 5
                globalRemediation: {
                    gameTimer                       : Infinity,
                    gameTimerVisible                : false,
                    roundsCount                     : 7,
                    totalTriesCount                 : 7,
                },
                localRemediation: {
                    sentencesCount                  : { min: 3, max: 3 }
                }
            }
        ]
    };
});