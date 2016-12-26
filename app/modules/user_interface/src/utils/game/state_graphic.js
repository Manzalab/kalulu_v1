/**
 * This module provides a Base class for objects with different graphic states.
**/
define([
	'../system/device_capabilities',
	'../game/state_machine',
	'../game/box_type'
], function (
	DeviceCapabilities,
	StateMachine,
	BoxType
) {
	
	// statics
	var animsAlpha = 1;
	var boxesAlpha = 0;
	var boxesCache = [];
	
	function StateGraphic () {
		
		StateMachine.call(this);

		this._factory = null;
		this._anim = null;
		this._box = null;

		this._ANIM_SUFFIX = "";
		this._BOX_SUFFIX = "box";	
		this._DEFAULT_STATE = "";
		this._assetName = this.constructor.name;
		this._state = null;
		this._boxType = BoxType.NONE;
		this._hasAnimEnded = false;
	}

	StateGraphic.prototype = Object.create(StateMachine.prototype);
	StateGraphic.prototype.constructor = StateGraphic;

	/// "PUBLIC METHODS"
	StateGraphic.prototype.hasAnimEnded = function hasAnimEnded () {
		return this._hasAnimEnded;
	};

	StateGraphic.prototype.addBoxes = function addBoxes (pBoxesJsonList) {
		
		var lItem = null;
		var lObj = null;
		
		for (var lName in pBoxesJsonList) {

			if (!pBoxesJsonList.hasOwnProperty(lName)) continue;

			lItem = pBoxesJsonList.lName;
			boxesCache[lName] = [];
			
			for (var lObjName in lItem) {

				if (!lItem.hasOwnProperty(lObjName)) continue;

				lObj = lItem.lObjName;
				
				if (lObj.type === "Rectangle") boxesCache[lName][lObjName] = new PIXI3.Rectangle(lObj.x, lObj.y, lObj.width, lObj.height);
				else if (lObj.type === "Ellipse") boxesCache[lName][lObjName] = new PIXI3.Ellipse(lObj.x, lObj.y, lObj.width/2, lObj.height/2);
				else if (lObj.type === "Circle") boxesCache[lName][lObjName] = new PIXI3.Circle(lObj.x, lObj.y, lObj.radius);
				else if (lObj.type === "Point") boxesCache[lName][lObjName] = new PIXI3.Point(lObj.x, lObj.y);
			}
		}
	};


	StateGraphic.prototype.getBoxes = function getBoxes (pState) {

		return boxesCache[this._assetName + "_" + pState];
	};

	StateGraphic.prototype.pause = function pause () {
		if (this._anim !== null) this._anim.stop();
	};
	
	StateGraphic.prototype.resume = function resume () {
		if (this._anim !== null) this._anim.play();
	};

	StateGraphic.prototype.getHitBox = function getHitbox () {
		return this._box;
		// Si on veut cibler une box plus précise dans une classe fille : return this._box.getChildByName("nom d'instance du MovieClip de type Rectangle ou Circle dans Flash IDE");
	};

	StateGraphic.prototype.getHitPoints = function getHitPoints () {
		return null;
		// liste de Points dans une classe fille : return [
		//     this._box.toGlobal(this._box.getChildByName("nom d'instance du MovieClip").position,
		//     this._box.toGlobal(this._box.getChildByName("nom d'instance du MovieClip").position
		// ];
	};

	StateGraphic.prototype.destroy = function destroy () {
		
		if (typeof this._anim.stop === "function") this._anim.stop();
		this.removeChild(this._anim);
		this._anim.destroy();
		
		if (this._box != this._anim) {
			this.removeChild(box);
			this._box.destroy();
			this._box = null;
		}
		
		this._anim = null;
		
		StateMachine.prototype.destroy.call(this);
	};

	// "PRIVATE" METHODS

	StateGraphic.prototype._setAnimEnded = function _setAnimEnded () {
		this._hasAnimEnded = true;
	};


	StateGraphic.prototype._setState = function _setState (pState, pLoop, pAutoPlay, pStartFrame) {

		var lClassName = Object.getPrototypeOf(this).constructor.name;
		
		if (this._state === pState) return;
		
		if (this._assetName === null) this._assetName = lClassName;
		
		this._state = pState;


		//console.log(Object.getPrototypeOf(this).constructor.name + " state : " + this._state);
		
		if (this._factory === null) console.error("[StateGraphic] You are trying to set a graphic state but no factory is defined for the animation (assetName " + this._assetName + ")");

		this._anim = this._factory.getAnim(this);
		
		
		if (this._anim === null) {			
			if (this._boxType === BoxType.SELF) {
				if (this._box !== null) this.removeChild(this._box);
				this._box = null;
			}
			this._anim = this._factory.create(this._getId(this._state));
			this._anim.scale.set(1 / DeviceCapabilities.textureRatio , 1 / DeviceCapabilities.textureRatio);
			if (animsAlpha < 1) this._anim.alpha = animsAlpha;
			this.addChild(this._anim);
		} else {
			this._factory.update(this._getId(this._state));
		}

		this._hasAnimEnded = false;
		
		this._anim.loop = pLoop;
		this._factory.setFrame(pAutoPlay, pStartFrame);
		
		if (this._box === null) {
			if (this._boxType === BoxType.SELF) {
				this._box = this._anim;
				return;
			} else {
				this._box = new PIXI3.Container();
				if (this._boxType !== BoxType.NONE) this._createBox();
			}
			this.addChild(this._box);
		} else if (this._boxType == BoxType.MULTIPLE) {
			this.removeChild(this._box);
			this._box = new PIXI3.Container();
			this._createBox();
			this.addChild(this._box);
		}
	};

	StateGraphic.prototype._getId = function getId (pState) {

		if (pState === this._DEFAULT_STATE)
			return this._assetName + this._ANIM_SUFFIX;
		else{
			//console.log(this._assetName + "_" + pState + this._ANIM_SUFFIX)
			return this._assetName + "_" + pState + this._ANIM_SUFFIX;
		}
	};

	StateGraphic.prototype._createBox = function _createBox () {

		var lBoxes = this._getBox((this._boxType == BoxType.MULTIPLE ? this._state + "_" : "" )  + this._BOX_SUFFIX);
		var lChild = null;
		
		for (var lBox in lBoxes) {

			if (!lBoxes.hasOwnProperty(lBox)) continue;
			lChild = new PIXI3.Graphics();
			lChild.beginFill(0xFF2222);

			if (Object.getPrototypeOf(lBoxes[lBox]).constructor.name === "Rectangle") {
				lChild.drawRect(lBoxes[lBox].x, lBoxes[lBox].y, lBoxes[lBox].width, lBoxes[lBox].height);
			}
			else if (Object.getPrototypeOf(lBoxes[lBox]).constructor.name === "Ellipse") {
				lChild.drawEllipse(lBoxes[lBox].x, lBoxes[lBox].y, lBoxes[lBox].width, lBoxes[lBox].height);
			}
			else if (Object.getPrototypeOf(lBoxes[lBox]).constructor.name === "Circle") {
				lChild.drawCircle(lBoxes[lBox].x,lBoxes[lBox].y,lBoxes[lBox].radius);
			}
			else if (Object.getPrototypeOf(lBoxes[lBox]).constructor.name === "Point") {
				lChild.drawCircle(0, 0, 10);
			}
			lChild.endFill();
			
			lChild.name = lBox;
			if (Object.getPrototypeOf(lBoxes[lBox]).constructor.name === "Point") {
				lChild.position.set(lBoxes[lBox].x, lBoxes[lBox].y);
			}
			else {
				lChild.hitArea = lBoxes[lBox];
			}
			 
			this._box.addChild(lChild);
		}

		if (boxesAlpha === 0) {
			this._box.renderable = false;
		}
		else {
			this._box.alpha= boxesAlpha;
		}
	};

	return StateGraphic;
});