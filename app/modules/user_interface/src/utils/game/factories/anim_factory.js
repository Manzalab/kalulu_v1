/**
 * This module is a base to be derived depending on the chosen method for animations (spritesheets or atlases)
**/
define([], function () {

	function AnimFactory () {
		
		this._anim = null;
	}

	AnimFactory.prototype.getAnim = function getAnim () {
		return this._anim;
	};

	AnimFactory.prototype.create = function create (pId) {
		return null;
	};

	AnimFactory.prototype.update = function update (pId) {};

	AnimFactory.prototype.setFrame = function setFrame (pAutoPlay, pStart) {
		
		pAutoPlay = pAutoPlay || true;
		pStart = pStart || 0;
	};

	return AnimFactory;
});