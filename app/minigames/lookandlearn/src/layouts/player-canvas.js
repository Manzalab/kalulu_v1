/**
 * Created by Adrien on 08/08/2016.
 */
var Layout = require('./layout');
var dat = require('dat.gui');
var Tracing = require('../tracing');
var Emitter = require('../events/emitter');
var Events = require('../events/events');

function PlayerCanvasLayout(game, settings){
    Layout.call(this, game, settings);

    this.alreadyUnPainting = true;
    this.forceNoUpdate = false;

    this.correctBitmap = this.game.add.bitmapData(settings.w, settings.h);
    var i = this.correctBitmap.addToWorld(settings.x, settings.y);
    this.correctContext = this.game.add.bitmapData(settings.w, settings.h).ctx;
    this.group.add(i);

    this.bufferFading = false;
    this.bufferFadeSpeed = 2;
    this.bufferBitmap = this.game.add.bitmapData(settings.w, settings.h);
    this.bufferImage = this.bufferBitmap.addToWorld(settings.x, settings.y);
    this.group.add(this.bufferImage);

    this.painter = createPainter(this.context, this.bitmap, settings, game);

    settings.observer.offsetX += settings.drawOffset.x;
    settings.observer.offsetY += settings.drawOffset.y;
    this.observer = createObserver(settings.observer);

    this.helperGroup = game.add.group(undefined, 'PlayerCanvasLayout - HelperGroup');
    this.helperGroup.visible = false;
    settings.helper.offsetX += settings.drawOffset.x;
    settings.helper.offsetY += settings.drawOffset.y;
    this.helper = createHelper(settings.x, settings.y, settings.helper, game, this.helperGroup);

    this.enabled = false;

    var that = this;
    Emitter.on(Events.TRIGGER_LAYOUT, function(id){
      if(that.settings.waitedId === id){
          that.helperGroup.visible = true;
        that.enable();
      }
    });

    Emitter.on(Events.STEP_STARTED, function(step, point, lastGoodPoints){
      that.drawHelper(step, point, true);
      that.observer.setStep(step);
      that.painter.reset();

      if(lastGoodPoints !== undefined){
        that.drawSuccessPath(lastGoodPoints);
      }
    });

    Emitter.on(Events.WAYPOINT_VALIDATED, function(step, point){
      that.drawHelper(step, point, false);
    });

    Emitter.on(Events.PLAYER_IN_ERROR, function(){
      that.currentSheet = that.errorSheet;
      that.painter.pencil.goWrong();
    });

    Emitter.on(Events.PLAYER_NOT_IN_ERROR, function(){
      that.painter.pencil.goRight();
    });

    Emitter.on(Events.STEP_UNVALIDATED, function(lastPoint, goodPoints){
      that.drawSuccessPath(goodPoints);
      that.helper.drawFailPoint(lastPoint);
    });

    Emitter.on(Events.RESET_LETTER, function(){
      that.bufferBitmap.clear();
      that.bufferBitmap.copy(that.context.canvas);
      that.bufferFading = true;

      that.painter.clear();
    });

  Emitter.on(Events.END_LETTER, function(){
    that.clear();

    that.correctContext.clearRect(0, 0, that.correctBitmap.width, that.correctBitmap.height);
    that.correctBitmap.clear();
    that.correctBitmap.copy(that.correctContext.canvas);
  });

  Emitter.on(Events.WAIT_TRACING, function(){
      that.forceNoUpdate = true;
  });

  Emitter.on(Events.START_TRACING, function(){
      that.forceNoUpdate = false;
  });

  Emitter.on(Events.NEED_HELP_1, function(){
      Emitter.emit(Events.TRIGGER_LAYOUT, that.settings.id);
  });

  Emitter.on(Events.NEW_LETTER, function(){
      that.helperGroup.visible = false;
      that.disable();
  });

  if (this.game.gameConfig.debugPencil) {
    var gui = new dat.GUI();
    gui.domElement.id = 'gui';


    //pencil style
    gui.add(settings.pencilStyle, 'width').onChange(function(){
      that.painter.pencil.applyStyle();
    });
    gui.add(settings.pencilStyle, 'stroke').onChange(function(){
      that.painter.pencil.applyStyle();
    });

    //observer settings
    gui.add(settings.observer, 'maxDistance').min(100).max(2000).step(50);
    gui.add(settings.observer, 'maxDistanceForLast').min(100).max(2000).step(50);
    gui.add(settings.observer, 'longDistanceMaxAngleDiff').min(0).max(100).step(1);
    gui.add(settings.observer, 'shortDistanceMaxAngleDiff').min(0).max(100).step(1);
    gui.add(settings.observer, 'maxOwnAngle').min(0).max(100).step(1);
    gui.add(settings.observer, 'maximumErrorDistance').min(0).max(10000).step(100);
  }
}

PlayerCanvasLayout.prototype = Object.create(Layout.prototype);
PlayerCanvasLayout.prototype.constructor = PlayerCanvasLayout;
PlayerCanvasLayout.prototype.update = function PlayerCanvasLayoutUpdate(){
    if(!this.forceNoUpdate){
        Layout.prototype.update.call(this);

        this.painter.checkTouch();

        var canPaint = this.painter.isPainting;
        if(canPaint){
          this.alreadyUnPainting = false;

          canPaint = this.observer.checkStart(this.painter.pencil.position);
          var hasTouchedThisFrame = this.painter.update(canPaint);

          if(canPaint && hasTouchedThisFrame){
            this.observer.checkState(this.painter.pencil.position);
            this.observer.checkNext(this.painter.pencil.position, 1);
          }
        }else if(!this.alreadyUnPainting){
          this.observer.isAbleToPaint = false;
          this.observer.unvalidate(true);
          this.alreadyUnPainting = true;
      }else{
          this.observer.countTimeNoTouch();
      }

        if(this.bufferFading){
          this.bufferImage.alpha -= this.bufferFadeSpeed / 60;
          if(this.bufferImage.alpha <= 0){
            this.bufferBitmap.clear();
            this.bufferImage.alpha = 1;
            this.bufferFading = false;
          }
        }
    }
};

PlayerCanvasLayout.prototype.drawHelper = function PlayerCanvasLayoutDrawHelper(step, wp, drawFirst){
  this.helper.clear();
  this.helper.drawStep(step, drawFirst);

  var indexUp = 0;
  if(step.length-1 > wp){
    indexUp = 1;
  }
  this.helper.drawWayPoint(step[wp + indexUp]);
};

PlayerCanvasLayout.prototype.clear = function PlayerCanvasLayoutClear(){
  this.painter.clear();
  this.painter.reset();

  this.helper.clear();
  this.observer.reset();
};

PlayerCanvasLayout.prototype.drawSuccessPath = function PlayerCanvasDrawSuccessPath(points){
  this.painter.clear();

  this.painter.drawPath(points, {x: this.settings.helper.offsetX, y: this.settings.helper.offsetY}, this.correctContext, this.correctBitmap);
};


function createPainter(context, dest, settings, game){
    var pencil = new Tracing.Pencil(settings.pencilStyle, settings.drawOffset);
    var manualPainter = new Tracing.Painters.ManualPainter(context, dest, pencil, settings, game);

    return manualPainter;
}

function createObserver(settings){
    return new Tracing.Observer(settings);
}

function createHelper(x, y, settings, game, group){
    return new Tracing.Helper(x, y, settings, game, group);
}

module.exports = PlayerCanvasLayout;
