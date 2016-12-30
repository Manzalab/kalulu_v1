( function () {

    'use strict';

    var SoundManager            = require ('../utils/sound/sound_manager');
    var StateGraphic            = require ('../utils/game/state_graphic');
    var MovieClipAnimFactory    = require ('../utils/game/factories/movie_clip_anim_factory');

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

        this.kaluluButton;

        this._isStaying = false;
        this._fade = false;
        this.isTalking = false;
        this._kaluluSpeech = null;
        this._nextSpeechs = [];
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

    KaluluCharacter.prototype.initEvents = function initEvents(eventSystem)
    {
        this._eventSystem = eventSystem;
        this._eventSystem.on(Events.DEBUG.SKIP_KALULU, this.skip.bind(this));
    }
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
    }

    KaluluCharacter.prototype.wait = function wait () {
        this._setAnimEnded();
        this._setState(this.IDLE_1_STATE, true);
        this._anim.animationSpeed = 0.2;
    }

    KaluluCharacter.prototype.startTalk = function startTalk(talkName, nextTalks, shouldStay)
    {
        if (Config.skipKalulu) return;
        this.alpha = 1;
        this._isStaying = typeof shouldStay==='undefined'?false:true;
        if (this.kaluluButton!==undefined) this.kaluluButton.visible = false;
        if (this._kaluluSpeech && this.isTalking) this._kaluluSpeech.stop();
        this._kaluluSpeech = SoundManager.getSound(talkName);
        nextTalks = typeof nextTalks === 'undefined' ? []:nextTalks;
        this._nextSpeechs = nextTalks;

        if (this._kaluluSpeech===undefined)
        {
            console.error("The sound name '"+talkName+"' isn't valid.");
            return;
        }
        else if (this._nextSpeechs.length!==0)
            for (var i = 0; i < this._nextSpeechs.length; i++) {
                var lSound = SoundManager.getSound(this._nextSpeechs[i]);
                if (lSound===undefined)
                {
                    console.error("The sound name '"+talkName+"' isn't valid.");
                    return;
                }
            }
        SoundManager.getSound("kaluluOn").play();
        this._setState(this.APPEARANCE_STATE);
        this._anim.onComplete = this.talk.bind(this);
        this._anim.animationSpeed = 0.25;

        if (this._nextSpeechs.length===0)   this._kaluluSpeech.once( "end", this.disappear.bind(this));
        else   this._kaluluSpeech.once( "end", this.keepTalking.bind(this));

    }

    KaluluCharacter.prototype.talk = function talk()
    {
        this._hasAnimEnded = true;
        this._anim.onComplete = this.setAnimEnd.bind(this);
        this.isTalking = true;
        this._kaluluSpeech.play();
    }

    KaluluCharacter.prototype.keepTalking = function keepTalking()
    {
        var isSpeechEnded = this._nextSpeechs.length<=1;
        this._kaluluSpeech = SoundManager.getSound(this._nextSpeechs.shift());
        this._kaluluSpeech.once("end", isSpeechEnded?this.disappear.bind(this):this.keepTalking.bind(this));
        this._setState(this.IDLE_2_STATE, true);
        
        this.isTalking = false;
        this._nextSpeechTimeout = setTimeout(function(){
            this.isTalking = true;
            this._setState(this.TALK_3_STATE);
            this._anim.onComplete = this.setAnimEnd.bind(this);
            this._kaluluSpeech.play();
        }.bind(this),1618);
    }

    KaluluCharacter.prototype.update = function update()
    {
        //console.log(this.isTalking);
        if (this.isTalking && this.hasAnimEnded()) //remplacer this._anim.isAnimEnd par un isAnimEnd qui fonctionne et ça devrait marcher
        {
            var lRandom = Math.random();
            if (lRandom<=0.1) lRandom = 1;
            else if (lRandom<=0.3) lRandom = 0;
            else lRandom = 2;
            this._setState(this.TALK_STATES[lRandom]);
            this._anim.onComplete = this.setAnimEnd.bind(this);
            this._anim.animationSpeed = 0.25;
        }

        if (this._fade)
        {
            this.alpha*=0.9;
            if (this.alpha <=0.05)
            {
                this._fade = false;
                this.alpha = 0;
                if (this.kaluluButton!==undefined) this.kaluluButton.visible = true;
                this.isTalking = false;
            }  
        }
    }
    KaluluCharacter.prototype.setAnimEnd = function setAnimEnd()
    {
        this._setAnimEnded();
    }

    KaluluCharacter.prototype.disappear = function disappear()
    {
        
        this._anim.onComplete = null;
        if (this._isStaying) 
        {
            this._setState(this.IDLE_1_STATE, true);
            this.isTalking= false;
            return;
        }
        SoundManager.getSound("kaluluOff").play();
        this._setState(this.DISAPPEARANCE_STATE);
        this._anim.animationSpeed = 0.25;
        setTimeout(function(){this._fade = true;}.bind(this),500);
    }

    KaluluCharacter.prototype.stopSound = function stopSound()
    {
        if (this._kaluluSpeech!==undefined) this._kaluluSpeech.stop();
        this.isTalking = false;
    }

    KaluluCharacter.prototype.skip = function skip()
    {
        if (this.parent) this.parent.removeChild(this);
        if (this._kaluluSpeech) this._kaluluSpeech.stop();
        this.isTalking = false;
        if (!this.kaluluButton.visible) this.kaluluButton.visible = true;
        if (this._nextSpeechTimeout)  clearTimeout(this._nextSpeechTimeout);
    }

    module.exports = new KaluluCharacter();
})();