define(function(require, exports, module) {
    var UIContainer = require('./UIContainer');
    var ContainerSurface        = require('famous/surfaces/ContainerSurface');
    var Modifier                = require('famous/core/Modifier');
    var RenderNode              = require('famous/core/RenderNode');
    
    /**
     *  A UIContainer which will insert a layer into the DOM, 
     *  allowing you to attack overflow:hidden, and clip content, 
     *  or provide a imposible to clip backgorund. 
     *
     *  @class UIClipContainer
     *  @extends UIContainer
     */
    var UIClipContainer = UIContainer.extend({ 
        _containerStyles: { 
            overflow: 'hidden'
        },
        _containerClasses: ['ui-clip-container'],
        _perspective: 1000,

        constructor: function UIClipContainer (options) {
            this._applyOptions(options);
            this._callSuper(UIContainer, 'constructor', options);

            this._containerSurface = new ContainerSurface({
                properties: this._containerStyles,
                classes: this._containerClasses,
            });
            this._rootNode.add(this._containerSurface);
            this._rootNode = this._containerSurface;
        },
    });
    module.exports = UIClipContainer;
});
