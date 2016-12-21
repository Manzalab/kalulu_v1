/**
 * UIComponent is the base class for screens and popins. It should NOT be used for UI elements which compose a screen.
 * They can autobuild with the UI Builder via the function build() if a description is provided in a json.
 * On opening
 * 
**/
define([
    '../../../libs/pixi',
    '../game/game_object',
    '../events/event_type',
    '../events/mouse_event_type',
    '../events/touch_event_type',
    '../game/game_stage',
    './ui_positions',
    './ui_builder'
], function (
    PIXI3,
    GameObject,
    EventType,
    MouseEventType,
    TouchEventType,
    GameStage,
    UIPositions,
    UIBuilder
) {

    'use strict';

    var count = 0; // equivalent static
    

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################

    function UIComponent () {
        
        GameObject.call(this);      

        count++;
        // this.name = "UI Component " + count;
        this.name = this.constructor.name;

        /**
         * A modal object prevent the user to interact with elements behind it (default : a black overlay 0.6 alpha as background)
         * @type {boolean}
         * @private
        **/
        this._isModal = true;
        
        /**
         * @type {string}
        **/
        this.modalImage = "alpha_bg.png";
        
        /**
         * @type {boolean}
         * @private
        **/
        this._isOpen = false;


        /**
         * The sprite used as modal image
         * @type {PIXI.Sprite}
         * @private
        **/
        this._modalZone = null;

        /**
         * The list of elements that must be repositionned on GameStage resize
         * @type {Array<Positionables>}
         * @private
        **/
        this._positionables = [];
    }
    

    UIComponent.prototype = Object.create(GameObject.prototype);
    UIComponent.prototype.constructor = UIComponent;


    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    Object.defineProperties(UIComponent.prototype, {
        
        /**
         * A modal object prevent teh user to interact with elements behind it (default : a black overlay 0.6 alpha as background)
         * @type {boolean}
         * @memberof Namespace.UIComponent#
        **/
        isModal: {
            get: function () {
                return this._isModal;
            },
            set: function (value) {
                this._isModal = value;
                
                if (this._isModal) {
                    if (this._modalZone === null) {
                        this._modalZone = new PIXI3.Sprite(PIXI3.Texture.fromFrame(this.modalImage));
                        this._modalZone.interactive = true;
                        this._modalZone.on(MouseEventType.CLICK, this._stopPropagation, this);
                        this._modalZone.on(TouchEventType.TAP, this._stopPropagation, this);
                        this._positionables.unshift({ item:this._modalZone, align:UIPositions.FIT_SCREEN, offsetX:0, offsetY:0});
                        
                        if (Config.enableGlobalVars) window.kalulu[Object.getPrototypeOf(this).constructor.name + "_modal"] = this._modalZone;
                    }
                    if (this.parent !== null) {
                        this.parent.addChildAt(this._modalZone, this.parent.getChildIndex(this));
                        
                    }
                }
                else {  
                    
                    if (this._modalZone !== null) {
                        if (this._modalZone.parent !== null) {
                            this._modalZone.parent.removeChild(this._modalZone);
                            
                        }
                        this._modalZone.off(MouseEventType.CLICK, this._stopPropagation);
                        this._modalZone.off(TouchEventType.TAP, this._stopPropagation);
                        this._modalZone = null;
                        if (this._positionables[0].item === this._modalZone) this._positionables.shift();
                    }
                }
                
                return this._isModal;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    UIComponent.prototype.build = function build () {
        
        // console.info("[UIComponent] " + this.constructor.name + " started to build itself.");
        var positionables = this._builderCall();
        var positionablesCount = positionables.length;
        // console.info("[UIComponent] " + this.constructor.name + " detected " + positionablesCount + " components.");

        for (var c = 0 ; c < positionablesCount ; c++) {
            var lPositionable = positionables[c];
            /*if (lPositionable.item.name.indexOf("BG") !== -1) this.addChildAt(lPositionable.item, 0);
            else */this.addChild(lPositionable.item);
            if (lPositionable.align !== "") this._positionables.push(lPositionable); // no need to move the centered items on Resize.
        }
    };

    UIComponent.prototype.open = function open () {
        
        if (this._isOpen) return;
        this._isOpen = true;
        this.isModal = this._isModal;
        if (!this.name) this.name = "UI Component " + count;

        GameStage.on(EventType.RESIZE, this._onGameStageResize, this);
        this._onGameStageResize();
    };

    UIComponent.prototype.close = function close () {
        
        if (!this._isOpen) return;
        this._isOpen = false;
        
        this.isModal = false;
        
        this.destroy();
    };

    UIComponent.prototype.destroy = function destroy () {
        this.close();
        GameStage.off(EventType.RESIZE, this._onGameStageResize, this);
        GameObject.prototype.destroy.call(this);
    };



    // ##############################################################################################################################################
    // ###  PRIVATE METHODS  ########################################################################################################################
    // ##############################################################################################################################################

    UIComponent.prototype._onGameStageResize = function _onGameStageResize (eventData) {
        
        var length = this._positionables.length;
        for (var p = 0 ; p < length ; p++) {

            var lObj = this._positionables[p];

            if (lObj.update) {
                if (lObj.align === UIPositions.TOP || lObj.align === UIPositions.TOP_LEFT || lObj.align === UIPositions.TOP_RIGHT) {
                    lObj.offsetY = this.parent.y + lObj.item.y;
                } else if (lObj.align === UIPositions.BOTTOM || lObj.align === UIPositions.BOTTOM_LEFT || lObj.align === UIPositions.BOTTOM_RIGHT) {    
                    lObj.offsetY = GameStage.safeZone.height - this.parent.y - lObj.item.y;
                }
                
                if (lObj.align === UIPositions.LEFT || lObj.align === UIPositions.TOP_LEFT || lObj.align === UIPositions.BOTTOM_LEFT) {
                    lObj.offsetX = this.parent.x + lObj.item.x;
                } else if (lObj.align === UIPositions.RIGHT || lObj.align === UIPositions.TOP_RIGHT || lObj.align === UIPositions.BOTTOM_RIGHT) {   
                    lObj.offsetX = GameStage.safeZone.width - this.parent.x - lObj.item.x;
                }
                
                lObj.update = false;
            }

            UIPositions.setPosition(lObj.item, lObj.align, lObj.offsetX, lObj.offsetY);
        }
    };


    UIComponent.prototype._builderCall = function _builderCall () {
        
        return UIBuilder.build(this, undefined, UIComponent);
    };


    UIComponent.prototype._stopPropagation = function _stopPropagation (event) {
        event.stopPropagation();
    };


    return UIComponent;
});