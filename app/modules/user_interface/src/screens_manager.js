/**
 * This module is in charge of displaying popins and screens in an organized way.
 * 
**/
define([
    './utils/game/game_stage',
    './transitions/garden_transition'
], function (
    GameStage,
    GardenTransition
) {

    function ScreensManager () {

        this._openPopins = [];
        this._openTransition = null;
    }
    

    ScreensManager.prototype.openScreen = function openScreen (pScreen) {
        
        this.closeScreens();
        GameStage.getScreensContainer().addChild(pScreen);
        pScreen.open();
        console.info("[ScreensManager] Screen " + pScreen.constructor.name + " opened.");
    };
    
    ScreensManager.prototype.closeScreens = function closeScreens () {
        
        var lContainer = GameStage.getScreensContainer();
        
        while (lContainer.children.length > 0) {
            
            var lCurrentScreen = lContainer.getChildAt(lContainer.children.length - 1);
            
            lCurrentScreen.interactive = false;
            lContainer.removeChild(lCurrentScreen);
            
            lCurrentScreen.close();
        }
    };

    ScreensManager.prototype.openPopin = function openPopin (pPopin) {
        this._openPopins.push(pPopin);
        GameStage.getPopinsContainer().addChild(pPopin);
        pPopin.open();
    };

    ScreensManager.prototype.closeCurrentPopin = function closeCurrentPopin () {
        if (this._openPopins.length === 0) return;
        var lCurrentPopin = this._openPopins.pop();
        lCurrentPopin.interactive = false;
        GameStage.getPopinsContainer().removeChild(lCurrentPopin);
        lCurrentPopin.close();
    };

    ScreensManager.prototype.prepareTransition = function prepareTransition () {
        if (!this._gardenTransition) this._gardenTransition = new GardenTransition();
    };
    
    ScreensManager.prototype.openGardenTransition = function openGardenTransition (callback) {
        this._openTransition = this._gardenTransition;
        GameStage.getScreensTransitionsContainer().addChild(this._openTransition);
        this._openTransition.easeIn(2.6, callback);
    };

    ScreensManager.prototype.closeGardenTransition = function closeGardenTransition () {
        if (!this._openTransition) return;
        this._openTransition.easeOut(1, function () {
            GameStage.getScreensTransitionsContainer().removeChild(this._openTransition);
            this._openTransition = null;
        }.bind(this));
    };

    // var instance = new ScreensManager();
    // if (Config.debug) {
    //  if (!window.kalulu) window.kalulu = {};
    //  window.kalulu.ScreensManager = instance;
    // }
    return ScreensManager;
});