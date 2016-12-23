
define([
	"../utils/ui/ui_component",
	"../utils/ui/ui_positions",
	"../utils/system/device_capabilities"
	// "../pdfJs"
], function (
	UIComponent,
	UIPositions,
	DeviceCapabilities
	// PdfJs
) {
	'use strict';


	// ###############################################################################################################################################
	// ###  CONSTRUCTOR  #############################################################################################################################
	// ###############################################################################################################################################
	
	/**
	 * The Story class is ...
	 * @class
	 * @extends UIComponent
	 * @memberof Namespace (e.g. Kalulu.Remediation)
	 * @param parameter {Object} Description of the parameter
	**/
	function Story (storyId, interfaceManager) {
		

		this._interfaceManager = interfaceManager;

		UIComponent.call(this);
		this.name = "mcStory";
		this.build();

		this._hud = {
			left: this.getChildByName("mcStoryLHud"),
			right: this.getChildByName("mcStoryRHud")
		}
		this._buttonPrev = this._hud.left.getChildByName("mcButtonPrev");
		this._buttonPrev.visible = false;
		this._buttonNext = this._hud.right.getChildByName("mcButtonNext");
		this._storyBackground = this.getChildByName("mcStoryContainer");
		this._temporaryCanvas = document.createElement("canvas");
		this._currPageNumber = 1;
		this._pageSprite;

		// PdfJs.PDFJS.workerSrc = 'pdf.worker.kalulu.js';
		PdfJs.PDFJS.disableWorker = true;

		this._buttonNext.onClick = this._openNext.bind(this);
		this._buttonPrev.onClick = this._openPrev.bind(this);
		this._openPage = this._openPage.bind(this);
		PdfJs.getDocument(Config.pdfPath + "stories/story"+storyId+".pdf").then(function(pdfFile)
		{
			this._pdfFile = pdfFile;
			this._openPage(pdfFile, 1);
		}.bind(this));
	}

	Story.prototype = Object.create(UIComponent.prototype);
	Story.prototype.constructor = Story;



	// ###############################################################################################################################################
	// ###  GETTERS & SETTERS  #######################################################################################################################
	// ###############################################################################################################################################


	Object.defineProperties(Story.prototype, {
	});



	// ##############################################################################################################################################
	// ###  METHODS  ################################################################################################################################
	// ##############################################################################################################################################

	Story.prototype._openNext = function _openNext () 
	{
		var pageNumber = Math.min(this._pdfFile.numPages, this._currPageNumber + 1);
		if (pageNumber !== this._currPageNumber) {
		    this._currPageNumber = pageNumber;
		    this._openPage(this._pdfFile, this._currPageNumber);
		}
	};

	Story.prototype._openPrev = function _openPrev () 
	{
		var pageNumber = Math.max(1, this._currPageNumber - 1);
		if (pageNumber !== this._currPageNumber) {
		    this._currPageNumber = pageNumber;
		    this._openPage(this._pdfFile, this._currPageNumber);
		}
	};

	Story.prototype._openPage = function _openPage (pdfFile, pageNumber) 
	{
		pdfFile.getPage(pageNumber).then(function(page) {
			var canvas = this._temporaryCanvas;
			var context = canvas.getContext("2d");
			var viewport = page.getViewport(2.8);

			canvas.height = viewport.height;
			canvas.width = viewport.width;

			var renderContext = {
			    canvasContext: context,
			    viewport: viewport
			};
			page.render(renderContext).then(function()
			{
				if (this._addedToScreen) 
				{
					this._pageSprite.texture.update();
					return;
				}

				var lSprite = new PIXI3.Sprite(PIXI3.Texture.fromCanvas(canvas));
				this._pageSprite = lSprite;
				lSprite.anchor.set(0.5,0.5);
				this._storyBackground.addChild(lSprite);
				this._addedToScreen = true;
				this._modalZone.once('click', this._onClickClose, this);

			}.bind(this));
		}.bind(this));
		
		if (pageNumber === 1) this._buttonPrev.visible = false;
		else if (pageNumber === pdfFile.numPages) this._buttonNext.visible = false;
		else 
		{
			this._buttonPrev.visible = true;
			this._buttonNext.visible = true;
		}
	};

	Story.prototype._onClickClose = function _onClickClose () 
	{
		this._interfaceManager.closePopin(this);
	};

	return Story;
});