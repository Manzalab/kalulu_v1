/**
 * Created by Adrien on 11/08/2016.
 */
var Victor  = require('victor');
var Emitter = require('../events/emitter');
var Events  = require('../events/events');

function Observer(settings){
    this.settings = settings;

    this.step = [];

    this.reset();

    this.nbOfErrors = 0;
    this.usedHelp1 = false;
    this.usedHelp2 = false;

    this.pastTime = 0;
}

Observer.prototype.setStep = function ObserverSetStep(step){
  this.usedHelp1 = false;
  this.usedHelp2 = false;
  this.nbOfErrors = 0;

  this.step = step;
  this.reset();
};

Observer.prototype.countTimeNoTouch = function ObserverCountTimeNoTouch(){
  this.pastTime += 1/60;
  if(this.pastTime >= this.settings.timeBeforeHelp1 && !this.usedHelp1){
      this.usedHelp1 = true;
      this.pastTime = 0;

      Emitter.emit(Events.NEED_HELP_1);
  }
};

Observer.prototype.checkDistanceFromPlayer = function ObserverCheckDistanceFromPlayer(playerPosition, pointPosition, max){
  this.pPos.x = playerPosition.x - this.settings.offsetX;
  this.pPos.y = playerPosition.y - this.settings.offsetY;
  var dist = distance(pointPosition, this.pPos);

  return (dist <= max);
};

Observer.prototype.checkStart = function ObserverCheckStart(playerPosition){
  this.pastTime = 0;
  if(!this.isAbleToPaint){
    if(this.checkDistanceFromPlayer(playerPosition, this.startPoint, this.settings.maxDistance)){
      this.isAbleToPaint = true;

      this.lastGoodPoint.x = this.startPoint.x;
      this.lastGoodPoint.y = this.startPoint.y;

      this.goodPoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y});
      this.localGoodpoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y});
    }else{
      return false;
    }
  }

  return true;
};

Observer.prototype.checkState = function ObserverCheckState(playerPosition){
  var lastPoint = new Victor(this.lastGoodPoint.x, this.lastGoodPoint.y);
  var player = new Victor(playerPosition.x - this.settings.offsetX, playerPosition.y - this.settings.offsetY);
  var dist = lastPoint.distance(player);

  if(dist >= this.settings.maxDistancePerFrame){
    var chunkSize = dist / 10;
    var currentDistance = chunkSize;

    var vectorAB = lastPoint.clone().subtract(player);
    var abnorm = vectorAB.norm();
    var point = this.lastGoodPoint;

    for(currentDistance; currentDistance < dist; currentDistance += chunkSize){
      var mult = new Victor(currentDistance, currentDistance);

      point = getPointForAt(lastPoint.clone(), abnorm.clone(), mult);
      var toCheck = {
        x: point.x + this.settings.offsetX,
        y: point.y + this.settings.offsetY
      };

      var isCorrect = this.checkDirection(toCheck);

      if(!isCorrect){
        var isInError = this.computeErrors(toCheck);
        if(isInError){
          var failed = this.computeFailure(toCheck);
          if(failed){
            break;
          }
        }
      }else{
        this.lastGoodPoint = point;
        this.goodPoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y});
        this.localGoodpoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y})
      }
    }
  }else{
    var isCorrect = this.checkDirection(playerPosition);
    if(!isCorrect){
      var isInError = this.computeErrors(playerPosition);
      if(isInError){
        this.computeFailure(playerPosition);
      }
    }
  }
};

Observer.prototype.checkDirection = function ObserverCheckDirection(playerPosition){
  var i = this.checkPoint - 1;
  var v1 = new Victor(this.lastGoodPoint.x || this.step[i].x, this.lastGoodPoint.y || this.step[i].y);

  //player direction relative to last way point
  var v2 = new Victor(playerPosition.x - this.settings.offsetX, playerPosition.y - this.settings.offsetY);
  var actualDirection = v2.clone().subtract(v1).norm();

  //model direction
  var v3 = new Victor(this.step[i+1].x, this.step[i+1].y);
  var modelDirection = v3.clone().subtract(v1).norm();

  //player own direction
  var referentPoint = getClosestPointOnLineSegment(v1.clone(), v3.clone(), new Victor(this.lastGoodPoint.x, this.lastGoodPoint.y));
  var ownDirection = v2.clone().subtract(referentPoint).norm();

  var modelAngle = modelDirection.angleDeg();
  var actualAngle = actualDirection.angleDeg();
  var ownAngle = ownDirection.angleDeg();
  var angleDiffWithModel = Math.abs(modelAngle - actualAngle);
  var angleDiffWithOwn = Math.abs(modelAngle - ownAngle);

  var nextStep = new Victor(this.step[i+1].x, this.step[i+1].y);
  var dist = v2.distance(nextStep);

  // debug of directions
  var multiplier = new Victor(100, 100);
  Emitter.emit(Events.DEBUG_DIRECTION, modelDirection.clone().multiply(multiplier), actualDirection.clone().multiply(multiplier));
  Emitter.emit(Events.DEBUG_DERIVING, referentPoint.clone(), ownDirection.clone().multiply(multiplier));


  var lastPointMaxAngle;
  if(this.checkPoint === this.step.length-1){
    lastPointMaxAngle = 0.01;
  }
  var maxAngleDiff = remap(dist, 0, v1.distance(nextStep), lastPointMaxAngle || this.settings.shortDistanceMaxAngleDiff, this.settings.longDistanceMaxAngleDiff);
  var isNotDeriving = ((this.lastGoodPoint.x === -100 && this.lastGoodPoint.y === -100) || (angleDiffWithOwn <= this.settings.maxOwnAngle));
  var isSucceding = (angleDiffWithModel <= maxAngleDiff);

  if(isSucceding && isNotDeriving){
    this.lastGoodPoint.x = playerPosition.x - this.settings.offsetX;
    this.lastGoodPoint.y = playerPosition.y - this.settings.offsetY;

    this.goodPoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y});
    this.localGoodpoints.push({x: this.lastGoodPoint.x, y: this.lastGoodPoint.y})
  }else if(isSucceding){
    Emitter.emit(Events.PLAYER_NOT_IN_ERROR);
  }

  return (isSucceding && isNotDeriving);
};

Observer.prototype.checkNext = function ObserverCheckNext(playerPosition, nextIncrement){
  var current = this.step[this.checkPoint];
  var next = this.step[this.checkPoint + nextIncrement];
  var further = false;

  if(next !== undefined){
    var subVector = {x: next.x - current.x, y:next.y - current.y};
    var widthVector = new Victor(10, 10);
    var widthVectorInverse = widthVector.clone().multiply(new Victor(-1, -1));

    var perpVector1 = (new Victor(-subVector.y, subVector.x)).norm().multiply(widthVector).add(current);
    var perpVector2 = (new Victor(-subVector.y, subVector.x)).norm().multiply(widthVectorInverse).add(current);

    var playerSide = Math.sign((perpVector2.x - perpVector1.x) * ((playerPosition.y - this.settings.offsetY) - perpVector1.y) - (perpVector2.y - perpVector1.y) * ((playerPosition.x - this.settings.offsetX) - perpVector1.x));
    var targetSide = Math.sign((perpVector2.x - perpVector1.x) * (next.y - perpVector1.y) - (perpVector2.y - perpVector1.y) * (next.x - perpVector1.x));

    var maxDistance = this.settings.maxDistance;

    further = (playerSide === targetSide || playerSide === 0 || this.checkDistanceFromPlayer(playerPosition, current, maxDistance));
    if(!further){
      this.checkNext(playerPosition, nextIncrement + 1);
    }
  }else{
    further = this.checkDistanceFromPlayer(playerPosition, current, this.settings.maxDistanceForLast);
  }


  if(further && nextIncrement > 1){
    var isInError = this.computeErrors(playerPosition);
    if(isInError){
      this.computeFailure(playerPosition);
    }
  }
  else if(further){
    this.validate();

    return true;
  }

  return false;
};

Observer.prototype.computeErrors = function ObserverComputeErrors(playerPosition){
  if(this.lastGoodPoint.x === -100 && this.lastGoodPoint.y === -100){
    this.lastGoodPoint.x = playerPosition.x + this.settings.offsetX;
    this.lastGoodPoint.y = playerPosition.y + this.settings.offsetY;
  }
  if(!this.checkDistanceFromPlayer(playerPosition, this.lastGoodPoint, this.settings.distanceBeforeRed)){
    Emitter.emit(Events.PLAYER_IN_ERROR);
    return true;
  }

  Emitter.emit(Events.PLAYER_NOT_IN_ERROR);
  return false;
};

Observer.prototype.computeFailure = function ObserverComputeErrors(playerPosition){
  if(!this.checkDistanceFromPlayer(playerPosition, this.lastGoodPoint, this.settings.maximumErrorDistance)){
    this.unvalidate();
    return true;
  }

  return false;
};

Observer.prototype.validate = function ObserverValidate(){
  this.checkPoint++;

  if(this.checkPoint >= this.step.length){
    this.localGoodpoints.push({x: this.step[this.step.length - 1].x, y: this.step[this.step.length - 1].y});
    Emitter.emit(Events.STEP_VALIDATED, this.localGoodpoints);
    this.localGoodpoints.length = 0;
    //##console.log(this.localGoodpoints);
  }else{
    Emitter.emit(Events.WAYPOINT_VALIDATED, this.step, this.checkPoint);
  }
};

Observer.prototype.unvalidate = function ObserverUnvalidate(noReset){
  //this.reset();
  //this.lastGoodPoint = {};
  this.lastWayPoint = {};
  this.isAbleToPaint = false;
  this.startPoint = this.lastGoodPoint;

  Emitter.emit(Events.STEP_UNVALIDATED, this.lastGoodPoint, this.localGoodpoints);

  if(!noReset){
      this.nbOfErrors++;
      if(this.nbOfErrors > this.settings.nbErrorBeforeHelp1 && !this.usedHelp1){
          this.usedHelp1 = true;

          Emitter.emit(Events.NEED_HELP_1);
      }else if(this.nbOfErrors > this.settings.nbErrorBeforeHelp2 && !this.usedHelp2){
          this.usedHelp2 = true;

          Emitter.emit(Events.NEED_HELP_2);
      }
  }
};

Observer.prototype.reset = function ObserverReset(){
  this.isAbleToPaint = false;
  this.checkPoint = 1;

  this.pPos = {
    x:0,
    y:0
  };
  this.lastWayPoint = {};
  this.goodPoints = [];
  this.localGoodpoints = [];

  this.startPoint = this.lastGoodPoint = this.step[0];
};

function distance(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y);
}

function remap(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getClosestPointOnLineSegment(pointA, pointB, pointP)
{
  var aToP = pointP.subtract(pointA);
  var aToB = pointB.clone().subtract(pointA);

  var aToBMagn = aToB.lengthSq();
  var dotABAP = aToP.dot(aToB);
  var distance = dotABAP / aToBMagn;

  if (distance < 0)
  {
    return pointA;

  }
  else if (distance > 1)             {
    return pointB;
  }
  else
  {
    return pointA.add(aToB.multiply(new Victor(distance, distance)));
  }
}

function getPointForAt(a, abnorm, mult) {
  return a.add(abnorm.multiply(mult));
}

module.exports = Observer;
