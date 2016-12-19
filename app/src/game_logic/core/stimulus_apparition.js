define([], function () {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The StimulusApparition is used to record the life of a stimulus on screen during a minigame using Detection Signal Theory.
     * It is created by a Minigame and parsed by the related Discipline Module
     * @class
     * @memberof Kalulu.GameLogic.Core
     * @param isCorrect {boolean} is this stimulus a correct response ?
    **/
    function StimulusApparition (isCorrect) {

        /**
         * The number of seconds elapsed betwwen apparition and player's input
         * @type {number}
         * @private
        **/
        this._elapsedTime = null;

        /**
         * is this stimulus a correct response ?
         * @type {boolean}
         * @private
        **/
        this._isCorrect = isCorrect;

        /**
         * has this stimulus been clicked or tapped by the player ?
         * @type {number}
         * @private
        **/
        this._isClicked = false;

        /**
         * is this apparition closed ? (only the closed apparitions will be saved)
         * @type {boolean}
         * @private
        **/
        this._isClosed = false;
    }




    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(StimulusApparition.prototype, {
        
        /**
         * is this stimulus a correct response ?
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.StimulusApparition#
        **/
        isCorrect: {
            get: function () { return this._isCorrect; },
        },

        /**
         * did the player click or tap the stimulus ?
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.StimulusApparition#
        **/
        isClicked: {
            get: function () { return this._isClicked; },
        },

        /**
         * A closed appearance is valid for save. An unclosed appearance should be discarded.
         * @type {boolean}
         * @memberof Kalulu.GameLogic.Core.StimulusApparition#
        **/
        isClosed: {
            get: function () { return this._isClosed; },
        },

        /**
         * the time between appearance and click, or appearance and disappearance
         * @type {number}
         * @memberof Kalulu.GameLogic.Core.StimulusApparition#
        **/
        elapsedTime : {
            get: function () { return this._elapsedTime; }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Close the apparition with the player's response. If it's a click, the endTime is recorded, if not, the startTime is deleted (not significant)
     * @param isClicked {boolean} did the player click or tap the stimulus ?
     * @param elapsedTime {number} optional - number of seconds elapsed between apparition and player's input
    **/
    StimulusApparition.prototype.close = function close (isClicked, elapsedTime) {
        
        this._isClicked = isClicked;

        if (this._isClicked) {
            this._elapsedTime = elapsedTime;
        }

        this._isClosed = true;
    };

    return StimulusApparition;
});