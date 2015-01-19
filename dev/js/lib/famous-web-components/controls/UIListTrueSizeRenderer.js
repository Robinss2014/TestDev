define(function(require, exports, module) {
    var UIComponent = require('ui/core/UIComponent');
    var UIElement = require('ui/core/UIElement');
    var UILabel = require('ui/controls/UILabel');

    var UITrueSizeListRenderer = UILabel.extend(/** @lends UILabel.prototype */{
        /**
         * Default item renderer for UIList.
         *
         * @class UITrueSizeListRenderer
         * @uses UILabel
         * @constructor
         *
         * @param {Object} [options] options to be applied to UITrueSizeListRenderer.
         */
        constructor: function UITrueSizeListRenderer(options) {
            this._callSuper(UILabel, 'constructor', options);

            this.setStyle({
                fontSize: '30px'
            })

            var r = Math.round(Math.random() * 254);
            var g = Math.round(Math.random() * 254);
            var b = Math.round(Math.random() * 254);
            this._addChild(new UIElement({
                style: {
                    zIndex: -200,
                    backgroundColor: 'rgb(200, 100, 200)'
                }
            }));

            if(options.item) this.setItem(options.item)
        },

        /**
         * Handler for click events on component.  Calls setSelected on self and emits
         * event for UIList to adjust current selected index.
         *
         * @method _handleClick
         */
        _handleClick: function _handleClick() {
            this.setSelected();
            this.emit('selected', this);
        },

        /**
         * Adjusts internal CSS properties in response to selection.
         *
         * @method setSelected
         */
        setSelected : function setSelected() {
            this._background.addClass('UIListItem-selected');
        },

        /**
         * Adjusts internal CSS properties in response to deselection.
         *
         * @method deselect
         */
        deselect : function deselect() {
            this._background.removeClass('UIListItem-selected');
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
            this.setText(item.label);
        }
    });

    module.exports = UITrueSizeListRenderer
});