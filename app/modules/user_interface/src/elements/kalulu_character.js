( function () {
    
    var SoundManager            = require ('../utils/sound/sound_manager');
    var StateGraphic            = require ('../utils/game/state_graphic');
    var MovieClipAnimFactory    = require ('../utils/game/factories/movie_clip_anim_factory');

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

        this.isTalking = false;
        this._kaluluSound = null;
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

    KaluluCharacter.prototype.startTalk = function startTalk(soundName)
    {
        this._kaluluSound = SoundManager.getSound(soundName);
        if (this._kaluluSound===undefined)
        {
            console.error("The soundName '"+soundName+"' isn't valid.")
            return;
        }
        this._setState(this.APPEARANCE_STATE);
        this._anim.onComplete = this.talk.bind(this);
        this._anim.animationSpeed = 0.25;
        this._kaluluSound.on( "end", this.disappear.bind(this));
    };

    KaluluCharacter.prototype.talk = function talk()
    {
        this.isTalking = true;
        this._kaluluSound.play();
    };

    KaluluCharacter.prototype.update = function update()
    {
        if (this.isTalking && this._anim.isAnimEnd) //remplacer this._anim.isAnimEnd par un isAnimEnd qui fonctionne et ça devrait marcher
        {
            var lRandom = Math.random();
            if (lRandom<=0.1) lRandom = 1;
            else if (lRandom<=0.3) lRandom = 0;
            else lRandom = 2;
            this._setState(this.TALK_STATES[lRandom]);
            this._anim.animationSpeed = 0.2;
        }
    }

    KaluluCharacter.prototype.disappear = function disappear()
    {
        this._setState(this.DISAPPEARANCE_STATE);
        this._anim.onComplete = null;
        this._anim.animationSpeed = 0.25;
    };

    KaluluCharacter.prototype.stopSound = function stopSound()
    {
        if (this._kaluluSound!==undefined) this._kaluluSound.stop();
        this.isTalking = false;
    }


    module.exports = KaluluCharacter;
})();