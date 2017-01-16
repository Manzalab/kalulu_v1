define([], function () {

    /**
     * This configuration object is used to parameter the minigames using the Detection Signal Theory. 
     * It contains both global and local remediation settings.
    **/

    return {
        baseConfig: { // the "baseConfig" settings are a base to all difficulty levels, overriden by the level specific values.
            generalParameters: { // those will never change after the initial tuning
                secondsOfPauseAfterCorrectResponse: 1,
                secondsOfPauseAfterIncorrectResponse: 1.5,
                missedCorrectStimuliCountTriggeringPermanentHelp: 3,
                capitalLettersShare: 0.4,
                caterpillarSpeed: 10
            },
            globalRemediation: {   // the global remediation settings are invariable inside a game but can evolve depending on globalLevel from one game to the next
                gameType: "assessment", // "identification", "composition", "pairing", or "other"
                gameTimer: Infinity,     // should the game end after a certain amount of seconds ?
                gameTimerVisible: false,        // is this Timer visible ?
                roundTimer: Infinity,     // should each round end after a certain amount of seconds ?
                roundTimerVisible: false,        // is this Timer visible ?
                roundsCount: 0,            // the amount of rounds, (Rafiki will provide one target per round)
                currentLessonShareInTargets: 0.8,          // the amount of targets taken in the current lesson (vs. revision targets from previous lessons)
                roundTargetClass: "Word",   // the class of a round Target
                stepTargetClass: "GP",   // the class of a step Target (if same than round --> identification, if component -> composition)
                stepsToPlay: "All",        // should all the steps be played or are some given ? e.g. [1, 0, 0, 1] 
                minimumSortedWords: 0,
                minimumWinRatio: 0
            },
            localRemediation: { // the local remediation settings are used to adapt the difficulty inside a game. The game divide the min-max range in 5 stages and starts at the middle one.
         
            }
        },
        levels: [ // the settings for difficulty levels 1 to 5
            { // LEVEL 1
                globalRemediation: {
                    gameTimer: 180,
                    minimumSortedWords: 10,
                    minimumWinRatio: 0.5
                },
                localRemediation: {

                }
                    
            },
            { // LEVEL 2
                globalRemediation: {
                    gameTimer: 180,
                    minimumSortedWords: 10,
                    minimumWinRatio: 0.5
                },
                localRemediation: {
                   
                }
            },
            { // LEVEL 3
                globalRemediation: {
                    gameTimer: 180,
                    minimumSortedWords: 10,
                    minimumWinRatio: 0.5
                },
                localRemediation: {
                   
                }
            },
            { // LEVEL 4
                globalRemediation: {
                    gameTimer: 180,
                    minimumSortedWords: 10,
                    minimumWinRatio: 0.5
                },
                localRemediation: {
                   
                }
            },
            { // LEVEL 5
                globalRemediation: {
                    gameTimer: 180,
                    minimumSortedWords: 10,
                    minimumWinRatio: 0.5
                },
                localRemediation: {
                    
                }
            }
        ]
    };
});