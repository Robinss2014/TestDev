define(function(require, exports, module) {
    var CanvasSurface    = require('famous/surfaces/CanvasSurface');
    var UIElement = require('./UIElement');

    var UICanvasElement = UIElement.extend({ 
        constructor: function UICanvasElement(options) {
            this._callSuper(UIElement, 'constructor', options);
        },
        _createSurface: function (options) {
            var opts = {
                properties: options.style,
            };
            if (options.size) {
                opts.canvasSize = [options.size[0] * 2, options.size[1] * 2]; // retina resolution
                opts.size = options.size;
            }
            this._surface = new CanvasSurface(opts);

            this._rootNode.add(this._surface);

            this._surface.pipe(this._genericSync);
            this._surface.pipe(this);
        },
        getContext: function (contextType) {
            return this._surface.getContext(contextType);
        }
    });
    module.exports = UICanvasElement;
});
