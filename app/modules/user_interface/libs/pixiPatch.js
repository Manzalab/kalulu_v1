/**
 * Série de patchs Pixi en attendant le Fix officiel
 * @author Mathieu Anthoine
 */

PIXI.interaction.InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive)
{
	
	if(!displayObject || !displayObject.visible)
    {
        return false;
    }
    
    var hit = false,
        interactiveParent = interactive = displayObject.interactive || interactive;

    if(displayObject.hitArea)
    {
        interactiveParent = false;
    }

    if(displayObject.interactiveChildren)
    {       
        var children = displayObject.children;
        
        for (var i = children.length-1; i >= 0; i--)
        {
			
			if(! hit  && hitTest)
            {
                hit = this.processInteractive(point, children[i], func, true, interactive );
            }
            else
            {
                this.processInteractive(point, children[i], func, false, false );
            }
			
        }
    }

    if(interactive)
    {
        if(hitTest && !hit)
        {  
            if(displayObject.hitArea)
            {
                displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
            }
            else if(displayObject.containsPoint)
            {
                hit = displayObject.containsPoint(point);
            }
        }

        if(displayObject.interactive)
        {
            func(displayObject, hit); 
        }
    }

    return hit;
  
};