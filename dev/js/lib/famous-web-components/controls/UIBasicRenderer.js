define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement = require('../core/UIElement');
    var UILabel = require('./UILabel');

    var UIBasicRenderer = UIComponent.extend(/** @lends UIComponent.prototype */{
        /**
         * Default item renderer for UIList.
         *
         * @class UIBasicRenderer
         * @uses UIComponent
         * @constructor
         *
         * @param {Object} [options] options to be applied to UIBasicRenderer.
         */
        constructor: function UIBasicRenderer(options) {
            this._callSuper(UIComponent, 'constructor', options);
            if(options.item) this.setItem(options.item)
        },

        /**
         * Function called on 'swap' of renderer from UIList.
         *
         * @method animateIn
         */
        animateIn : function animateIn() {},

        /**
         * Passes item to renderer which decides how to render the item visually.
         *
         * @method setItem
         * @param {Object} [item] Item that will be represented by the renderer.
         */
        setItem : function setItem(item) {
            console.log(item);
            this._addChild(item);
        }
    });

    module.exports = UIBasicRenderer
});
