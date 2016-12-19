/**
 * Loading Screen with a progression bar.
 * 
**/
define([
	"utils/ui/screen"
], function (
	Screen
) {

	function GraphicLoader () {
		
		var width = 980; // en attendant réparation du bug de PIXI3 qui empeche d'avoir la vraie width à la première frame. -_-

		Screen.call(this);
		this.name = "LoadingScreen";
		this._background = new PIXI3.Sprite(PIXI3.Texture.fromFrame("preload_bg.png"));
		this._background.anchor.set(0.5, 0.5);
		this.addChild(this._background);
		
		this._loaderBar = new PIXI3.Sprite(PIXI3.Texture.fromFrame("preload.png"));
		this.addChild(this._loaderBar);
		this._loaderBar.anchor.y = 0.5;
		this._loaderBar.x = - width / 2;
		if (Config.enableKaluluGlobalDebug) window.kalulu.GraphicLoader = this;
		//console.log(this._loaderBar.width);
		this.reset();
	}

	GraphicLoader.prototype = Object.create(Screen.prototype);
	GraphicLoader.prototype.constructor = GraphicLoader;


	GraphicLoader.prototype.update = function update (pProgress) {
		this._loaderBar.scale.x = pProgress;
	};

	GraphicLoader.prototype.reset = function reset () {
		this._loaderBar.scale.x = 0;
	};

	return GraphicLoader;
});