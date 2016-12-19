/**
 * This module is a simple list of the supported collision box types.
**/
define([], function () {

	function BoxType () {
		
		this.NONE		= "nobox";
		this.SIMPLE 	= "simplebox";
		this.MULTIPLE	= "multibox";
		this.SELF 		= "selfbox";
	}

	return new BoxType();
});