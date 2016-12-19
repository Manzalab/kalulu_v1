define ([
    '../system/device_capabilities',
], function (
    DeviceCapabilities
) {
    var LEFT            = "left";
    var RIGHT           = "right";
    var TOP             = "top";
    var BOTTOM          = "bottom";
    var TOP_LEFT        = "topLeft";
    var TOP_RIGHT       = "topRight";
    var BOTTOM_LEFT     = "bottomLeft";
    var BOTTOM_RIGHT    = "bottomRight";
    var FIT_WIDTH       = "fitWidth";
    var FIT_HEIGHT      = "fitHeight";
    var FIT_SCREEN      = "fitScreen";

    return {
        
        LEFT            : LEFT,
        RIGHT           : RIGHT,
        TOP             : TOP,
        BOTTOM          : BOTTOM,
        TOP_LEFT        : TOP_LEFT,
        TOP_RIGHT       : TOP_RIGHT,
        BOTTOM_LEFT     : BOTTOM_LEFT,
        BOTTOM_RIGHT    : BOTTOM_RIGHT,
        FIT_WIDTH       : FIT_WIDTH,
        FIT_HEIGHT      : FIT_HEIGHT,
        FIT_SCREEN      : FIT_SCREEN,
        
        setPosition     : function setPosition (uiComponent, position, offsetX, offsetY) {
        
            offsetX = typeof offsetX === undefined ? 0 : offsetX;
            offsetY = typeof offsetY === undefined ? 0 : offsetY;
            
            var lScreen = DeviceCapabilities.getScreenRect(uiComponent.parent); //PIXI3.Rectangle
            
            var lTopLeft = new PIXI3.Point (lScreen.x, lScreen.y);
            var lBottomRight = new PIXI3.Point (lScreen.x + lScreen.width, lScreen.y + lScreen.height);

            if (position === TOP || position === TOP_LEFT || position === TOP_RIGHT) uiComponent.y = lTopLeft.y + offsetY;
            if (position === BOTTOM || position === BOTTOM_LEFT || position === BOTTOM_RIGHT) uiComponent.y = lBottomRight.y - offsetY;
            if (position === LEFT || position === TOP_LEFT || position === BOTTOM_LEFT) uiComponent.x = lTopLeft.x + offsetX;
            if (position === RIGHT || position === TOP_RIGHT || position === BOTTOM_RIGHT) uiComponent.x = lBottomRight.x - offsetX;
            
            if (position === FIT_WIDTH || position === FIT_SCREEN) {
                uiComponent.x = lTopLeft.x;
                uiComponent.width = lBottomRight.x - lTopLeft.x;
            }
            if (position === FIT_HEIGHT || position === FIT_SCREEN) {
                uiComponent.y = lTopLeft.y;
                uiComponent.height = lBottomRight.y - lTopLeft.y;
            }
        }
    };
});
