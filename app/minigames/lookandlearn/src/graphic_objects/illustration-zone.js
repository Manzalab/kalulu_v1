(function () {
    
    'use strict';

    function IllustrationZone (game, parent, notionIds) {
        
        Phaser.Group.call(this, game, parent, 'IllustrationZone');
        
        this._notionIds = notionIds;
        this._currentNotion = null;
        
        this._illustrations = {};
        
        var notionsCount = this._notionIds.length;
        for (var i = 0 ; i < notionsCount ; i++) {

            var lNotionId = this._notionIds[i];
            this._addIllustration(lNotionId, 960, 400);
        }
    }

    IllustrationZone.prototype = Object.create(Phaser.Group.prototype);
    IllustrationZone.prototype.constructor = IllustrationZone;


    IllustrationZone.prototype._addIllustration = function addIllustration (notionId, x, y) {
        
        var lImage = new Phaser.Sprite(this.game, x, y, 'notion_' + notionId);
        lImage.anchor.set(0.5, 0.5);
        var scaleRatio = 600/lImage.height;
        lImage.scale.set(scaleRatio, scaleRatio);
        lImage.visible = false;
        this.add(lImage);

        this._illustrations[notionId] = lImage;
    };

    /**
     * shows the required notion's illustration
    **/
    IllustrationZone.prototype.show = function setIllustrationVisible (notionId) {
        if (this._currentIllustration) this._currentIllustration.visible = false;
        this._currentIllustration = this._illustrations[notionId];
        this._currentIllustration.visible = true;
    };

    
    IllustrationZone.prototype._setIllustrationInvisible = function setIllustrationInvisible (notionId) {
        if (notionId && this._illustrations[notionId]) this._illustrations[notionId].visible = false;
        else if (this._currentIllustration) this._currentIllustration.visible = false;
    };
    
    module.exports = IllustrationZone;
})();