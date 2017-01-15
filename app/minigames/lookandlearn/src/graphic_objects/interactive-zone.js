(function () {
    
    'use strict';
    
    var loadLayouts     = require('../tracing-logic/layouts');
    var TracerBotLayout = require('../tracing-logic/layouts/tracer-bot');
    var BotCanvasLayout = require('../tracing-logic/layouts/bot-canvas');
    var Tracing         = require('../tracing-logic/tracing');
    var Emitter         = require('../tracing-logic/events/emitter');
    var Events          = require('../tracing-logic/events/events');
    var InstaTrace      = require('../tracing-logic/tracing/insta-trace');

    var GraphemeButton  = require('./grapheme-button');
    var stats           = require('../../assets/config/graph-stats.json');



    function InteractiveZone (game, parent, rawButtonsData, callback) {
        
        Phaser.Group.call(this, game, parent, 'InteractiveZone');
        
        this._isStarted = false;
        this._graphemeButtons = {};

        this._buttonsData = this._getButtonsData(rawButtonsData);
        this._setupTracer();
        this._toUpdate = [];

        var buttonsCount = this._buttonsData.length;
        for (var i = 0 ; i < buttonsCount ; i++) {

            var lData = this._buttonsData[i];
            var lButton = new GraphemeButton(this.game, this, lData, this.game.rafiki.font, callback);

            if (lData.toTrace) {
                if (lButton.draw(this._tracer))
                    this._toUpdate.push(lButton);
            }
            else lButton.printFromFont();

            this._graphemeButtons[lButton.name] = lButton;
        }

        if (this.game.gameConfig.globalVars) window.lookandlearn.interactiveZone = this;

        this.game.eventManager.on('pause', this.disableGraphemeButtons, this);
        this.game.eventManager.on('unPause', this.enableGraphemeButtons, this);
    }

    InteractiveZone.prototype = Object.create(Phaser.Group.prototype);
    InteractiveZone.prototype.constructor = InteractiveZone;

    InteractiveZone.prototype._getButtonsData = function getButtonsData (rawButtonsData) {
        
        var buttonRectangles = this._getButtonRectangles(rawButtonsData);
        
        var buttonsData = [];

        for (var id in rawButtonsData) {
            buttonsData.push({
                id        : id,
                graphemes : rawButtonsData[id],
                rectangle : buttonRectangles[id],
                toTrace   : true
            });
        }
        
        return buttonsData;
    };

    InteractiveZone.prototype._getButtonRectangles = function getButtonRectangles (rawButtonsData) {

        var buttonsCount = _.size(rawButtonsData);
        var availableWidth = this.game.width - 400; // 400 for left and right ui
        var sidesMargin = 30; // the space between grapheme buttons
        var widthPerNotion = (availableWidth / buttonsCount) - 2 * sidesMargin;

        var buttonRectangles = {};

        var i = 0;
        for (var id in rawButtonsData) {
            var graphemesList = rawButtonsData[i];

            var buttonRectangle = {
                x      : 200 + i * (widthPerNotion + 2 * sidesMargin) + (sidesMargin + widthPerNotion/2),
                y      : 1000,
                width  : widthPerNotion,
                height : Math.min(450, widthPerNotion)
            };
            buttonRectangles[id] = buttonRectangle;
            i++;
        }

        return buttonRectangles;
    };

    InteractiveZone.prototype._setupTracer = function setupTracerImagePhase () {

        this._timeBeforeTracing = null;
        this.secondsOfDelay = 0.8;
        var tracerScaleRatio = this.scaleRatio = 0.8;

        this._tracer = new BotCanvasLayout(this.game, this.game.gameConfig.layouts.tracerBotLayout);
        this._tracer.name = "InteractiveZone._tracer";
    };


    InteractiveZone.prototype.start = function start () {
        
        console.info('InteractiveZone is now available');
        this.disableInteractivity();

        this._isStarted = true;

        // this._timeBeforeTracing = Math.round(this.secondsOfDelay * 60);
        for (var grapheme in this._graphemeButtons) {
            this._graphemeButtons[grapheme].easeIn();
        }
    };

    InteractiveZone.prototype.update = function updateInteractiveZone () {
        
        if (this._isStarted) {
            var count = this._toUpdate.length;
            for (var i = 0 ; i < count ; i++) this._toUpdate[i].update();
        }

        var allTracingComplete = true;
        for (var buttonName in this._graphemeButtons) {
            var lButton = this._graphemeButtons[buttonName];
            if (!lButton.isAvailable) {
                allTracingComplete = false;
                break;
            }
        }
        if (allTracingComplete) {
            console.log('Complete');
            this.enableInteractivity();
            this.update = function () {};
        }
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


    InteractiveZone.prototype.disableInteractivity = function disableInteractivity () {
        this.game.ui.disableUiMenu();
        this.disableGraphemeButtons();
    };

    InteractiveZone.prototype.enableInteractivity = function enableInteractivity () {
        this.game.ui.enableUiMenu();
        this.enableGraphemeButtons();
    };

    InteractiveZone.prototype.disableGraphemeButtons = function disableGraphemeButtons () {
        
        for (var graphId in this._graphemeButtons) {
            if (!this._graphemeButtons.hasOwnProperty(graphId)) continue;
            this._graphemeButtons[graphId].disableInput();
        }
    };

    InteractiveZone.prototype.enableGraphemeButtons = function enableGraphemeButtons () {

        for (var graphId in this._graphemeButtons) {
            if (!this._graphemeButtons.hasOwnProperty(graphId)) continue;
            this._graphemeButtons[graphId].enableInput();
        }
    };

    InteractiveZone.prototype.destroy = function destroy () {
        this.game.eventManager.off('pause', this.disableGraphemeButtons, this);
        this.game.eventManager.off('unPause', this.enableGraphemeButtons, this);

        this._isStarted         = null;
        this._graphemeButtons   = null;
        
        this._buttonsData       = null;
        this._timeBeforeTracing = null;
        this.secondsOfDelay     = null;
        this.scaleRatio         = null;
        
        this._tracer            = null;
        this._toUpdate          = null;
    };

    module.exports = InteractiveZone;
})();