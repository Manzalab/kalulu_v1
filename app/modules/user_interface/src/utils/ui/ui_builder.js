define([
    './ui_positions',
    './ui_asset',
    './button'
], function (
    UIPositions,
    UIAsset,
    Button
) {
    
    'use strict';
    var Type;

    var flashPositionPrefixes = {
        "L"  : UIPositions.LEFT,
        "R"  : UIPositions.RIGHT,
        "T"  : UIPositions.TOP,
        "B"  : UIPositions.BOTTOM,
        "TL" : UIPositions.TOP_LEFT,
        "TR" : UIPositions.TOP_RIGHT,
        "BL" : UIPositions.BOTTOM_LEFT,
        "BR" : UIPositions.BOTTOM_RIGHT,
        "FW" : UIPositions.FIT_WIDTH,
        "FH" : UIPositions.FIT_HEIGHT,
        "FS" : UIPositions.FIT_SCREEN
    };

    var flashTypeSuffixes = {
        TXT_SUFFIX : "_txt",
        BTN_SUFFIX : "_btn",
        MC_SUFFIX  : "_mc",
    };

    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The UIBuilder allows to parse a UI descriptive JSON file and build the described UI in game.
     * @class
     * @memberof Namespace (e.g. Kalulu.Remediation)
    **/
    function UIBuilder () {

        /**
         * the description of UI
         * @type {object}
         * @private
        **/
        this._descriptions = null;
    }

    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################


    Object.defineProperties(UIBuilder.prototype, {
        
        /**
         * Description of the accessor
         * @type {boolean}
         * @memberof Namespace.UIBuilder#
        **/
        privateMemberAccessor: {
            get: function () {
                return this._privateMember;
            },
            set: function (value) {
                return null;
            }
        }
    });



    // ##############################################################################################################################################
    // ###  METHODS  ################################################################################################################################
    // ##############################################################################################################################################


    /**
     * Record the UI description
     * @param object {object} description of the UI
    **/
    UIBuilder.prototype.addDescription = function addDescription (object) {
        //console.log(object);
        this._descriptions = object;
    };

    /**
     * Instanciate the components of an UI element and returns them in a UIPositionnables Array
     * @param object {object} description of the UI
     * @return {uiPositionnable[]} an array of elements ready to be added in the given UI Component
    **/
    UIBuilder.prototype.build = function build (elementToBuild, description) {
        // console.log(elementToBuild);
        // console.log(description);
        // runtime require to prevent circular dependency at compilation.
        if (typeof Type === "undefined") Type = require('../../dynamic_type');
        
        var id = elementToBuild.name;

        description = typeof description === "undefined" ? this._descriptions[id] : description;
        if (!description) {
            console.warn("[UI Builder] unidentified element " + elementToBuild.name + ", returning []");
            console.log(this._descriptions);
            return [];
        }
        else {
            //console.info("[UIBuilder] Building " + id);
        }
        
        var uiPositionnables = [];
        
        // console.log(description);
        
        if (description.components) {

            var subComponent, subCompId, subCompClassname, subCompDescription;
            var subComponentsCount = _.size(description.components);
            var dynamicClassName;
            for (subCompId in description.components) {

                if (!description.components.hasOwnProperty(subCompId)) continue;

                subCompDescription = description.components[subCompId];
                subCompClassname = subCompDescription.classname;
                
                // console.log(subCompId + " : ");
                // console.log(subCompClassname);
                // console.log(subCompDescription);

                if (subCompClassname.indexOf(flashTypeSuffixes.TXT_SUFFIX) !== -1 && subCompClassname.indexOf(flashTypeSuffixes.TXT_SUFFIX) === subCompClassname.length - flashTypeSuffixes.TXT_SUFFIX.length) {
                    // console.log("[UIBuilder] Processing Text Subcomponent");

                    // var txtStyle = getTextStyle(subCompClassname);
                    // console.log(subCompDescription);
                    subComponent = new PIXI3.Text(subCompDescription.text, subCompDescription);
                }
                else if (subCompClassname.indexOf(flashTypeSuffixes.BTN_SUFFIX) !== -1 && subCompClassname.indexOf(flashTypeSuffixes.BTN_SUFFIX) === subCompClassname.length - flashTypeSuffixes.BTN_SUFFIX.length) {
                    // console.log("[UIBuilder] Processing Button Subcomponent");
                    var split = subCompClassname.split("_");
                    if (split.length === 2) subComponent = new Button(split[0]);
                    else if (split.length === 3) subComponent = new Button(split[1]);
                }
                else if (subCompDescription.uiType === "MovieClip") {
                    // console.log("[UIBuilder] Processing MovieClip Subcomponent");

                    // Here we have to deal with the special case of garden buttons :
                    if(subCompClassname.indexOf("GardenButton") !== -1) {
                        //console.log("GardenButton detected");
                        dynamicClassName = "GardenButton";
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                        subCompId = "mcGardenButton" + parseInt(subCompClassname.split("_")[1], 10);
                    }
                    else if(subCompClassname.indexOf("SpriteGarden_") !== -1) {
                        // console.log("SpriteGarden detected");
                        dynamicClassName = "SpriteGarden";
                        subComponent = Type.createInstance(dynamicClassName, subCompClassname);
                        subCompId = "mcSpriteGarden" + parseInt(subCompClassname.split("SpriteGarden_")[1], 10);
                    }
                    else if(subCompClassname.indexOf("Plant_") !== -1) {
                        dynamicClassName = "Plant";
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                        subCompId = "mcPlant_" + parseInt(subCompClassname.split("_")[1], 10) + "_" + parseInt(subCompClassname.split("_")[2], 10);
                    }
                    else if(subCompClassname.indexOf("BonusPathA_") !== -1) {
                        //console.log("Path detected : " + subCompClassname);
                        dynamicClassName = "Path";
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                        subCompId = "mcBonusPathA" + parseInt(subCompClassname.split("PathA_")[1], 10);
                    }
                    else if(subCompClassname.indexOf("BonusPathB_") !== -1) {
                        //console.log("Path detected");
                        dynamicClassName = "Path";
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                        subCompId = "mcBonusPathB" + parseInt(subCompClassname.split("PathB_")[1], 10);
                    }
                    else if(subCompClassname.indexOf("Garden_") !== -1) {
                        //console.log("Garden detected");
                        dynamicClassName = "Garden";
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                        subCompId = "mcGarden" + parseInt(subCompClassname.split("Garden_")[1], 10);
                    }
                    else if(subCompClassname.indexOf("LookAndLearnButton_") !== -1 || subCompClassname.indexOf("MinigameButton_") !== -1) {
                        // console.log("Garden detected");
                        dynamicClassName = subCompClassname.split("_")[0];
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId], subCompClassname);
                    }
                    else {
                        
                        dynamicClassName = subCompClassname;//.substr(0, subCompClassname.indexOf(flashTypeSuffixes.MC_SUFFIX));
                        // console.log(dynamicClassName);
                        subComponent = Type.createInstance(dynamicClassName, description.components[subCompId]);
                    }

                    if(subComponent) {
                        subCompClassname = dynamicClassName; // WHY???
                        // console.log("Yahoo");
                    }
                    else {
                        subComponent = new PIXI3.Container(); // no UIComponent, because UIComponent is something you can open, like a screen or a popin
                        subComponent.name = subCompId;
                        // console.log("Building Container " + subCompId);
                        var positionables = this.build(subComponent, description.components[subCompId]);
                        var componentsCount2 = positionables.length;
                        //console.info("[UIBuilder] detected " + componentsCount2 + " components.");
                        for (var d = 0 ; d < componentsCount2 ; d++) {
                            var lPositionable = positionables[d];
                            subComponent.addChild(lPositionable.item);
                            if (lPositionable.align !== "") subComponent._positionables.push(lPositionable); // no need to move the centered items on Resize.
                        }
                    }
                }
                else if (subCompDescription.uiType === "UIAsset"){
                    // console.log("[UIBuilder] Processing UIAsset Subcomponent : " + subCompClassname);
                    subComponent = new UIAsset(subCompClassname);
                }

                subComponent.name = subCompId;
                subComponent.position.set(subCompDescription.x, subCompDescription.y);
                subComponent.scale.set(subCompDescription.scaleX, subCompDescription.scaleY);
                subComponent.rotation = subCompDescription.rotation * Math.DEG2RAD;
                subComponent.zIndex = subCompDescription.zIndex;

                // console.log(subComponent);

                uiPositionnables.push(this.getUIPositionable(subComponent, flashPositionPrefixes[subCompClassname.split("_")[0]]));
            }
        }

        // elementToBuild.position.x   = description.x;
        // elementToBuild.position.y   = description.y;
        // elementToBuild.scale.x      = description.scaleX;
        // elementToBuild.scale.y      = description.scaleY;
        // elementToBuild.rotation     = description.rotation;
        // console.log(uiPositionnables);
        uiPositionnables = _.sortBy(uiPositionnables, "zIndex");
        // console.log(uiPositionnables);
        return uiPositionnables;
    };

    UIBuilder.prototype.getUIPositionable = function getUIPositionable (elementToBuild, position) {
        
        var offset = new PIXI3.Point(0,0);
        
        if (
            position !== UIPositions.BOTTOM &&
            position !== UIPositions.BOTTOM_LEFT &&
            position !== UIPositions.BOTTOM_RIGHT &&
            position !== UIPositions.FIT_HEIGHT &&
            position !== UIPositions.FIT_SCREEN &&
            position !== UIPositions.FIT_WIDTH &&
            position !== UIPositions.LEFT &&
            position !== UIPositions.RIGHT &&
            position !== UIPositions.TOP &&
            position !== UIPositions.TOP_LEFT &&
            position !== UIPositions.TOP_RIGHT
        ) position = "";
        else {
            if (position === UIPositions.TOP || position === UIPositions.TOP_LEFT || position === UIPositions.TOP_RIGHT ||
                position === UIPositions.BOTTOM || position === UIPositions.BOTTOM_LEFT || position === UIPositions.BOTTOM_RIGHT) offset.y = elementToBuild.y;
            if (position === UIPositions.LEFT || position === UIPositions.TOP_LEFT || position === UIPositions.BOTTOM_LEFT ||
                position === UIPositions.RIGHT || position === UIPositions.TOP_RIGHT || position === UIPositions.BOTTOM_RIGHT) offset.x = elementToBuild.x;     
        }
        var uiPositionnable = {item:elementToBuild, align:position, offsetX:offset.x, offsetY:offset.y, update:true, zIndex : elementToBuild.zIndex };
        // console.log(uiPositionnable);
        return uiPositionnable;
    };

    // UIBuilder.prototype.getTextStyle = function getTextStyle(id) {
    //     var lData;
        
    //     for (lDescription in description.keys()) {  
    //         lData = cast GameLoader.getContent("texts_"+lDescription);
    //         if (Reflect.hasField(lData, pId)) return Reflect.field(lData, pId);
    //     }
    //     return null;
    // };

    return new UIBuilder();
});