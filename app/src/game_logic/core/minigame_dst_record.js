define([], function () {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The MinigameDstRecord object is used to send data to Kalulu for a Minigame using Detection Signal Theory.
     * @class
     * @memberof Kalulu.GameLogic.Core
    **/
    function MinigameDstRecord () {
        
        /**
         * Timestamp of the startTime of the minigame
         * @type {(number | null)}
         * @private
        **/
        this._startTime = Date.now();

        /**
         * Timestamp of the endTime of the minigame
         * @type {(number | null)}
         * @private
        **/
        this._endTime = null;

        /**
         * has the player won the game ?
         * If the player game is lost 2 times in a row, Kalulu will trigger the change to a lower Global Difficulty Level
         * @type {boolean}
         * @private
        **/
        this._hasWon = false;

        /**
         * has the player reached the max local difficulty at the end of the game ?
         * If the player reaches the max level 2 times in a row, Kalulu will trigger the change to a higher Global Difficulty Level
         * @type {boolean}
         * @private
        **/
        this._hasReachedMaxLocalDifficulty = false;

        /**
         * The list of stimulus as sent by Kalulu, but completed with the StimulusApparitions
         * @type {object}
         * @private
        **/
        this._results = null;

        /**
         * The local remediation stage reached at the end of the game
         * @type {number}
         * @private
        **/
        this._finalLocalStage = null;
    }




    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(MinigameDstRecord.prototype, {
        
        /**
         * Timestamp of the startTime of the minigame
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        startTime: { get: function () { return this._startTime; } },
        
        /**
         * Timestamp of the startTime of the minigame
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        endTime: { get: function () { return this._endTime; } },
        
        /**
         * Timestamp of the startTime of the minigame
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        hasWon: { get: function () { return this._hasWon; } },
        
        /**
         * Timestamp of the startTime of the minigame
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        hasReachedMaxLocalDifficulty: { get: function () { return this._hasReachedMaxLocalDifficulty; } },
        
        /**
         * The results of the minigame (stimuliList sent by Kalulu completed with StimulusApparitions)
         * @type {object}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        results: { get: function () { return this._results; } },
        
        /**
         * The local remediation stage reached at the end of the game
         * @type {number}
         * @memberof Kalulu.GameLogic.Core.MinigameDstRecord#
        **/
        finalLocalStage: { get: function () { return this._finalLocalStage; } },
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Close the Record for the Game
     * @param hasWon {boolean}
     * @param results {object}
     * @param finalLocalStage {number} the local difficulty stage reached at the end of the game
    **/
    MinigameDstRecord.prototype.close = function close (hasWon, results, finalLocalStage) {
        
        this._hasWon = hasWon;
        this._endTime = Date.now();
        this._results = results;
        this._finalLocalStage = finalLocalStage;
    };

    return MinigameDstRecord;
});