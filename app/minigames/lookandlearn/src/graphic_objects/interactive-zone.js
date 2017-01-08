(function () {
    
    'use strict';
    
    var loadLayouts     = require('../tracing-logic/layouts');
    var TracerBotLayout = require('../tracing-logic/layouts/tracer-bot');
    var Tracing         = require('../tracing-logic/tracing');
    var Emitter         = require('../tracing-logic/events/emitter');
    var Events          = require('../tracing-logic/events/events');
    var InstaTrace      = require('../tracing-logic/tracing/insta-trace');

    var GraphemeButton  = require('./grapheme-button');
    var stats           = require('../../assets/config/graph-stats.json');



    function InteractiveZone (game, parent, notions, callback) {
        
        Phaser.Group.call(this, game, parent, 'InteractiveZone');
        
        this._notions = notions;
        
        this._isStarted = false;
        this._graphemeButtons = {};

        this._buttonsData = this._getButtonListFromNotions(notions);
        this._setupTracer();

        var buttonsCount = this._buttonsData.length;
        for (var i = 0 ; i < buttonsCount ; i++) {

            var lData = this._buttonsData[i];      
            var lButton = new GraphemeButton(this.game, this, lData, this.game.rafiki.font, callback);

            if (lData.toTrace) lButton.draw(this._tracer);
            else lButton.printFromFont();
            this._graphemeButtons[lData.value] = lButton;
        }

        // this._setTracerPositionToNotionX1(this._currentNotion);
        // this.progression = new Tracing.ProgressionHandler(this.game.gameConfig.progression, this.game);
        // this.tracingOn = false;

        // this.onFirstLetterTracingComplete = this.onFirstLetterTracingComplete.bind(this);
        // this.onSecondLetterTracingComplete = this.onSecondLetterTracingComplete.bind(this);

        if (this.game.gameConfig.globalVars) window.lookandlearn.interactiveZone = this;
    }

    InteractiveZone.prototype = Object.create(Phaser.Group.prototype);
    InteractiveZone.prototype.constructor = InteractiveZone;

    InteractiveZone.prototype._getButtonListFromNotions = function getButtonListFromNotions (notions) {
        
        var buttonRectangles = this._getButtonRectangles(notions);
        var notionsCount = notions.length;
        
        var buttonsList = [];

        for (var i = 0 ; i < notionsCount ; i++) {
            var lNotion = this._notions[i];

            if (lNotion.traceUppercase) {
                console.info("We will trace uppercase and lower case");
                var lButtonData = this._getFormattedButtonData(lNotion, buttonRectangles[lNotion.id], true);
                buttonsList.push(lButtonData);
            }

            var lButtonData = this._getFormattedButtonData(lNotion, buttonRectangles[lNotion.id]);
            buttonsList.push(lButtonData);
        }
        
        return buttonsList;
    };

    InteractiveZone.prototype._getFormattedButtonData = function getFormattedButtonData (notion, rectangle, forceUppercase) {
        return {
            value     : forceUppercase ? notion.textValue.toUpperCase() : notion.textValue,
            toTrace   : notion.toTrace,
            rectangle : rectangle,
            clicked   : false,
            notionData: notion
        };
    }

    InteractiveZone.prototype._getButtonRectangles = function getButtonRectangles (notions) {

        var notionsCount = notions.length;
        var availableWidth = this.game.width - 400 // 400 for left and right ui
        var sidesMargin = 30; // the space between grapheme buttons
        var widthPerNotion = (availableWidth / notionsCount) - 2 * sidesMargin;

        var buttonRectangles = {};

        for (var i = 0 ; i < notionsCount ; i++) {
            var lNotion = this._notions[i];

            var buttonRectangle = {
                x      : 200 + i * (widthPerNotion + 2 * sidesMargin) + (sidesMargin + widthPerNotion/2),
                y      : 1000,
                width  : widthPerNotion,
                height : Math.min(450, widthPerNotion)
            };
            buttonRectangles[lNotion.id] = buttonRectangle;
        }

        return buttonRectangles;
    };


    InteractiveZone.prototype._setupTracer = function setupTracerImagePhase () {

        this._timeBeforeTracing = null;
        this.secondsOfDelay = 0.8;
        var tracerScaleRatio = this.scaleRatio = 0.8;

        this._tracer = new TracerBotLayout(this.game, this.game.gameConfig.layouts.tracerBotLayout);
        this._tracer.name = "ImagePhase-BotLayout";
    };


    InteractiveZone.prototype.start = function start () {
        
        console.info('InteractiveZone is now available');
        this._isStarted = true;

        // this._timeBeforeTracing = Math.round(this.secondsOfDelay * 60);
        for (var grapheme in this._graphemeButtons) {
            this._graphemeButtons[grapheme].easeIn();
        }
    };

    InteractiveZone.prototype.update = function updateInteractiveZone () {
        
        // if (this._isStarted) {
        //     if (this._timeBeforeTracing === 0) this.startBotTracing(this._notions[0]);
        //     else this._timeBeforeTracing--;
            
        //     if (this._isDrawing) {
        //         this.tracingLayout.update();
        //     }
        // }
    };





    InteractiveZone.prototype.onFirstLetterTracingComplete = function onFirstLetterTracingComplete (layoutId) {
        
        Emitter.off(Events.TRIGGER_LAYOUT, this.onFirstLetterTracingComplete);

        // if (layoutId === 4) {
        //     console.info("Bot Layout just finished first letter");
        // }
        // else {
        //     console.info("Unidentified Layout just finished a letter");
        // }

        if (this.notion.traceUppercase) { // if we had to trace uppercase, we have now to trace the lower case.
            
            this.freezeLetter(this.xLeftLetter, this.yLetter);

            console.info("We will trace lowercase now");

            this.tracingLayout.group.x = this._tracerPositions[this._currentNotion.id].x2;

            Emitter.on(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);
            this.progression.setModel(this.notion.value.toLowerCase());
        }
        else {
            this.freezeLetter(this.xMidLetter, this.yLetter)
            this.endTracing();
        }
        
    };

    InteractiveZone.prototype.onSecondLetterTracingComplete = function onSecondLetterTracingComplete (layoutId) {
        
        Emitter.off(Events.TRIGGER_LAYOUT, this.onSecondLetterTracingComplete);

        // if (layoutId === 4) {
        //     console.info("Bot Layout just finished 2nd letter");
        // }
        // else {
        //     console.info("Unidentified Layout just finished a letter");
        // }

        this.freezeLetter(this.xRightLetter, this.yLetter);

        this.endTracing();
    };



    InteractiveZone.prototype.endTracing = function PhaseImageEndTracing () {
        
        this.tracingOn = false;
        this.imagePhaseStage.remove(this.tracingLayout.group, true);
        this.tracingLayout = null;
        this.game.layouts = [];

        this.lettersFrame.inputEnabled = true;
        this.lettersFrame.events.onInputDown.add(this.onClickOnLetters, this);
        this.lettersFrame.bounce();
    };



    InteractiveZone.prototype._checkNotion = function checkNotion (notion) {
        this._notionsChecklist[notion] = true;
        console.log(notion + ' has been checked : ' + this._notionsChecklist[notion]);

        this._allNotionsChecked = true;
        for (var lNotion in this._notionsChecklist) {
            if (!this._notionsChecklist.hasOwnProperty(lNotion)) continue;
            if (!this._notionsChecklist[lNotion]) {
                this._allNotionsChecked = false;
                console.log(lNotion + " has not been checked.");
                return;
            }
        }
    };

    InteractiveZone.prototype._disableInteractivity = function disableInteractivity (first_argument) {
        this.game.ui.disableUiMenu();
        for (var graphId in this._graphemeButtons) {
            if (!this._graphemeButtons.hasOwnProperty(graphId)) continue;
            this._graphemeButtons[graphId].inputEnabled = false;
        }
    };

    InteractiveZone.prototype._enableInteractivity = function enableInteractivity (first_argument) {
        if (this._allNotionsChecked) {
            console.log('All Checked !');
            this.enableNextStep();
        }
        else {
            console.log(this._notionsChecklist);
            this.game.ui.enableUiMenu();
        }

        for (var graphId in this._graphemeButtons) {
            if (!this._graphemeButtons.hasOwnProperty(graphId)) continue;
            this._graphemeButtons[graphId].inputEnabled = true;
        }
    };

    module.exports = InteractiveZone;
})();