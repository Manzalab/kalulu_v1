define([
    '../utils/game/state_graphic',
    '../utils/game/factories/movie_clip_anim_factory'
], function (
    StateGraphic,
    MovieClipAnimFactory
) {
    
    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The KaluluCharacter class is the graphic and vocal representation of the helping character.
     * @class
     * @extends StateGraphic
     * @memberof Namespace (e.g. Kalulu.Remediation)
     * @param parameter {Object} Description of the parameter
    **/
    function KaluluCharacter () {
        
        StateGraphic.call(this);
        this._assetName = "Kalulu";
        this._factory = new MovieClipAnimFactory();
        /**
         * Description of the member
         * @type {string}
        **/
        this.APPEARANCE_STATE = "Appearance_";
        this.DISAPPEARANCE_STATE = "Disappearance_";
        this.IDLE_1_STATE = "Idle1_";
        this.IDLE_2_STATE = "Idle2_";
        this.TALK_1_STATE = "Talk1_";
        this.TALK_2_STATE = "Talk2_";
        this.TALK_3_STATE = "Talk3_";
        this.TALK_STATES = [this.TALK_1_STATE, this.TALK_2_STATE, this.TALK_3_STATE];
    }

    KaluluCharacter.prototype = Object.create(StateGraphic.prototype);
    KaluluCharacter.prototype.constructor = KaluluCharacter;



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    // Object.defineProperties(KaluluCharacter.prototype, {});



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Returns something
     * @param paramName {Type} description of the parameter
     * @return {Type} description of the returned object
    **/
    KaluluCharacter.prototype.start = function start () {
        this._setState(this.APPEARANCE_STATE);
        this._anim.onComplete = this.wait.bind(this);
        this._anim.animationSpeed = 0.25;
        return null;
    };

    KaluluCharacter.prototype.wait = function wait () {
        this._setState(this.IDLE_1_STATE, true);
        this._anim.animationSpeed = 0.2;
    };

    KaluluCharacter.prototype.startTalk = function startTalk()
    {
        this._setState(this.APPEARANCE_STATE);
        this._anim.onComplete = this.talk.bind(this);
        this._anim.animationSpeed = 0.25;
    };

    KaluluCharacter.prototype.talk = function talk()
    {
        this._setState(this.TALK_STATES[Math.floor(Math.random()*this.TALK_STATES.length)], true);
        this._anim.animationSpeed = 0.2;
    };

    KaluluCharacter.prototype.disappear = function disappear()
    {
        this._setState(this.DISAPPEARANCE_STATE);
        this._anim.onComplete = null;
        this._anim.animationSpeed = 0.25;
    };


    return KaluluCharacter;
});