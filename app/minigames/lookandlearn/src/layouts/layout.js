var Phaser = require('phaser-bundle');

function Layout(game, settings, group){
  
  this.game = game;

  this.settings = settings;
  // console.log(settings);
  this.group = group || new Phaser.Group(game, null, 'LayoutGroup_' + settings.name);
  
  this.bitmap = new Phaser.BitmapData(this.game, 'bitmapForImage_' + settings.name, settings.w, settings.h);
  this.image = new Phaser.Image(this.game, settings.x, settings.y, this.bitmap);
  
  // this.debugBitmap = new Phaser.BitmapData(this.game, 'debugBG_' + settings.name, settings.w, settings.h);
  // this.debugBitmap.fill(255, 0, 255, 0.6);
  // this.debugBG = new Phaser.Image(game, 0, 0, this.debugBitmap);
  
  this.context = this.game.add.bitmapData(settings.w, settings.h).ctx;
  this.context.width = settings.w;
  this.context.height = settings.h;

  // this.group.add(this.debugBG);
  this.group.add(this.image);

  if (settings.enabled) {
    this.enable();
    // console.log("enable");
  } else {
    this.disable();
    // console.log("disable");
  }
}

Layout.prototype.update = function LayoutUpdate(){
};

Layout.prototype.enable = function LayoutEnable(){
  this.group.visible = true;
  this.enabled = true;
};

Layout.prototype.disable = function LayoutDisable(){
  this.group.visible = false;
  this.enabled = false;
};

module.exports = Layout;
