var Phaser = require('phaser-bundle');

/**
 * 
 * @param game     {object} reference to the phaser game
 * @param settings {object} cf. assets/config/layouts.json
 *    "name"             : string - the canvas name
 *    "enabled"          : boolean - defines the starting state of the layout. When enabled the group is visible, and the function update should be called.
 *    "pencilStyle"      : {"stroke": "0x000000", "width": "30"},
 *    "x"                : 0,
 *    "y"                : 0,
 *    "w"                : 1000,
 *    "h"                : 900,
 *    "id"               : 4,
 *    "waitedId"         : 5,
 *    "drawOffset"       : {"x": 40, "y":40},
 *    "callSounds"       : false,
 *    "isTouchSensitive" : false
 * @param group    {object} optional. defaults to new Phaser.Group(game, null, 'LayoutGroup_' + settings.name). Contains the image drawn.
**/
function Layout(game, settings, group){
  
  this.game = game;

  this.settings = settings;
  console.log(settings);
  this.group = group || new Phaser.Group(game, null, 'LayoutGroup_' + settings.name);
  
  this.setupCanvas(settings);

  if (settings.enabled) {
    this.enable();
    console.log("enable");
  } else {
    this.disable();
    console.log("disable");
  }
}

/**
 * @param settings {object} fields : name, x, y, w, h
**/
Layout.prototype.setupCanvas = function setupCanvas (settings) {
  
  if (this.debugBG && this.game.gameConfig.debugLayouts) this.group.remove(this.debugBG);
  if (this.image) this.group.remove(this.image);

  this.bitmap = new Phaser.BitmapData(this.game, 'bitmapForImage_' + settings.name, settings.w, settings.h);
  this.image  = new Phaser.Image(this.game, settings.x, settings.y, this.bitmap);
  
  if (this.game.gameConfig.debugLayouts) {
    this.debugBitmap = new Phaser.BitmapData(this.game, 'debugBG_' + settings.name, settings.w, settings.h);
    this.debugBitmap.fill(255, 0, 255, 0.6);
    this.debugBG = new Phaser.Image(this.game, 0, 0, this.debugBitmap);
  }
  
  this.context = this.game.add.bitmapData(settings.w, settings.h).ctx;
  this.context.width = settings.w;
  this.context.height = settings.h;

  if (this.game.gameConfig.debugLayouts) this.group.add(this.debugBG);
  this.group.add(this.image);
};

/**
 * To be overriden by subclasses. Should be called if this.enabled is set to true.
**/
Layout.prototype.update = function LayoutUpdate(){
};

/**
 * Set the group containing the image to visible, and this.enabled to true.
**/
Layout.prototype.enable = function LayoutEnable(){
  this.group.visible = true;
  this.enabled = true;
};

/**
 * Set the group containing the image to not visible, and this.enabled to false.
**/
Layout.prototype.disable = function LayoutDisable(){
  this.group.visible = false;
  this.enabled = false;
};

module.exports = Layout;
