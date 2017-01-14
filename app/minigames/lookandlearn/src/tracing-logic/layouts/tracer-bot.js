/**
 * Created by Cyprien on 02/08/2016.
 */
var Layout     = require('./layout');
var Tracing    = require('../tracing');
var Emitter    = require('../events/emitter');
var Events     = require('../events/events');
var stats      = require('../../../assets/config/graph-stats.json');
var graphsData = require('../../../assets/config/letters-descriptor.json');

/**
 * This Layout should be used to display an automatic drawing.
 * It reacts to the following events : NEW_LETTER, TRIGGER_LAYOUT, and NEED_HELP_2
 *  - NEW_LETTER clears the painter and set new letterId and model
 *  - TRIGGER_LAYOUT enables the layout if the event bears the correct eventData (cf. settings.waitedId)
 *  - NEED_HELP_2 emits a REDO_LETTER event for this.letterId and this.model
**/
function TracerBotLayout (game, settings) {

    Layout.call(this, game, settings);
    this.name = 'tracerBotLayout';
    this.painter = createPainter(this.context, this.bitmap, settings, game);
    this.triggered = false;
    this.sound = null;
    this.letterID = "";
    this.model = null;

    this.pointer = game.input.mousePointer;
    if(!game.device.desktop){
        this.pointer = game.input.pointer1;
    }

    var that = this;

    this.setModelForPainter = this.setModelForPainter.bind(this);
    Emitter.on(Events.NEW_LETTER, this.setModelForPainter);

    Emitter.on(Events.TRIGGER_LAYOUT, function(id){
        if(that.settings.waitedId === id){
            that.enable();
        }
    });

    Emitter.on(Events.NEED_HELP_2, function(){
        Emitter.emit(Events.REDO_LETTER, that.model, that.letterID);
    });
}
    


TracerBotLayout.prototype = Object.create(Layout.prototype);
TracerBotLayout.prototype.constructor = TracerBotLayout;

TracerBotLayout.prototype.setModelForPainter = function setModelForPainter (model, letter){

    this.updateLayout(letter);
    this.clear();
    this.painter.setup(model);

};

TracerBotLayout.prototype.getBitmap = function getBitmap (letter){
    
    var model = graphsData.letters[letter];

    this.setModelForPainter(model, letter);
    while(!this.painter.finished) this.painter.update(this.game);

    var bmp = new Phaser.BitmapData(this.game, 'bitmap_' + letter, this.graphSettings.w, this.graphSettings.h);
    console.log(this.graphSettings);
    bmp.copy(this.bitmap, 0, 0, this.graphSettings.w, this.graphSettings.h, 0, 0, this.graphSettings.w, this.graphSettings.h);

    return bmp;
};

TracerBotLayout.prototype.update = function TracerBotLayoutUpdate(){

    if(!this.painter.finished){
        this.painter.update(this.game);
        console.log(this.name + " : painter not finished with letter " + this.letterID);
    }
    else if(!this.triggered){
        console.log(this.name + " : trigger for letter " + this.letterID);
        
        console.log(this.name + " : setting Triggered. Currently set to " + this.triggered);
        this.triggered = true;
        console.log(this.name + " : setting Triggered. Currently set to " + this.triggered);
        Emitter.emit(Events.TRIGGER_LAYOUT, this.settings.id);
    }
    else if(this.settings.isTouchSensitive === true && this.checkTouch()){
        console.log(this.name + " : restarting");
        this.redoDrawing();
    }

    if (this.painter.waitForEnd && this.settings.callSounds === true && !this.soundPlayed && (this.sound === null || !this.sound.isPlaying)) {
        console.log(this.name + " : playing sound");
        this.sound = this.game.sound.play(this.game.gameConfig.pedagogicData.sound);
        this.sound.play();
        this.soundPlayed = true;
    }
};

TracerBotLayout.prototype.clear = function TracerBotLayoutClear(){
    console.log(this);
    this.triggered = false;

    this.painter.reset();
    this.painter.clear();

    console.log("clearing bot canvas : " + this.name);
    console.log("triggered : " + this.triggered);
    console.log("painter finished : " + this.painter.finished);
};

TracerBotLayout.prototype.checkTouch = function TracerBotLayoutCheckTouch(){
    var x, y;
    x = this.pointer.position.x;
    y = this.pointer.position.y;

    return (this.pointer.isDown && (x >= this.settings.x && x <= this.settings.w + this.settings.x && y >= this.settings.y && y <= this.settings.h + this.settings.y));
}

TracerBotLayout.prototype.redoDrawing = function TracerBotLayoutRedoDrawing(){
    this.clear();

    this.painter.setup(this.model);
}

TracerBotLayout.prototype.updateLayout = function updateLayout (graphId) {

    console.log('updating Layout');
    this.graphSettings = {
        name : this.name,
        x : 0,
        y : 0,
        w : stats[graphId].w,
        h : stats[graphId].h,
        pencilStyle : {
            stroke: 0x000000,
            width: 30
        },
        drawOffset : {
            x: stats[graphId].offsetX,
            y: stats[graphId].offsetY
        }
    }
    this.setupCanvas(this.graphSettings);
    this.painter = createPainter(this.context, this.bitmap, this.graphSettings, this.game);
};

/**
 * @param settings {object} pencilStyle, drawOffset
**/
function createPainter(context, dest, settings, game){
    var pencil = new Tracing.Pencil(settings.pencilStyle, settings.drawOffset);
    var autoPainter = new Tracing.Painters.AutoPainter(context, dest, pencil, game);

    return autoPainter;
}

module.exports = TracerBotLayout;