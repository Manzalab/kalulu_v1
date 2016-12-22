/**
 * Created by Adrien on 11/08/2016.
 */
function Helper(x, y, settings, game, group){
    this.sheet = game.add.graphics(x, y);
    group.add(this.sheet);

    this.settings = settings;

    this.lastStep = {};
    this.lastWP = {};
}

Helper.prototype.drawStep = function HelperDrawStep(step, drawFirst){
    var settings = this.settings;

    var firstPoint = step[0];
    var lastPoint = step[step.length - 1];

    if(drawFirst){
        this.sheet.beginFill(settings.startPointColor, 1);
        this.sheet.drawCircle(firstPoint.x + settings.offsetX, firstPoint.y + settings.offsetY, settings.stepPointSize);
        this.sheet.endFill();
    }

    this.sheet.beginFill(settings.endPointColor, 1);
    this.sheet.drawCircle(lastPoint.x + settings.offsetX, lastPoint.y + settings.offsetY, settings.stepPointSize);
    this.sheet.endFill();

    this.lastStep = step;
};

Helper.prototype.drawWayPoint = function HelperDrawStep(point){
    var settings = this.settings;

    this.sheet.beginFill(settings.wayPointColor, 1);
    this.sheet.drawRect(point.x + settings.offsetX - settings.wayPointSize/2, point.y + settings.offsetY - settings.wayPointSize/2, settings.wayPointSize, settings.wayPointSize);
    this.sheet.endFill();

    this.lastWP = point;
};

Helper.prototype.drawFailPoint = function HelperDrawFailPoint(point){
    var settings = this.settings;

    this.clear();
    this.drawStep(this.lastStep);
    this.drawWayPoint(this.lastWP);

    this.sheet.beginFill(settings.failPointColor, 1);
    this.sheet.drawCircle(point.x + settings.offsetX, point.y + settings.offsetY, settings.stepPointSize);
    this.sheet.endFill();
};

Helper.prototype.clear = function HelperClear(){
    this.sheet.clear();
};


module.exports = Helper;
