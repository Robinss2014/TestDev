define(function(require, exports, module) {

    var UIComponent = require('../../core/UIComponent');
    var UIElement = require('../../core/UIElement');
    var Easing = require('famous/transitions/Easing');

        /**
         * A Check box button class
         *
         * @param {Object} [options] options to be applied to the button
         * @param {Array | Numbers} [options.size] Size of bounding box
         * @param {Boolean} [options.selected] Selected status
         *
         * @example
         *  var CheckBoxIcon = new UICheckBoxIcon({
         *      size: [30, 30],
         *      selected: true 
         *  });
         *
         * @class UICheckBoxIcon
         * @constructor
         */

    var UIButtonBackground = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {

            this._callSuper(UIComponent, 'constructor', options);

            this._applyOptions(options);

            this._createElements();

        },

        /**
         * Created check box
         *
         * @protected
         * @method _createBox
         */
        _createElements: function (){
            this._backgroundElement = new UIElement({
                size : this.getSize(),
                style: this._style,
                classes: this._classes
            });
            this._addChild(this._backgroundElement);
        },

        /**
         *  Animate the Icon on setSelected event
         * @public
         * @method setSelected
         */
        setSelected: function(select,animate){
            
        },

        setPressed: function(p_pressed, animate) {
            this._backgroundElement.halt();
            this._backgroundElement.setOpacity(p_pressed? 0.75 : 1, {duration:150});
            if (p_pressed) {
                this._backgroundElement.setPosition(1,1,-10, {duration:150});
            } else {
                this._backgroundElement.setPosition(0,0,0, {duration:150});
            }
        }

    });

    module.exports = UIButtonBackground;
});
