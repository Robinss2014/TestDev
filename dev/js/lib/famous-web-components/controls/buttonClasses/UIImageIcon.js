define(function(require, exports, module) {

    var UIComponent = require('../../core/UIComponent');
    var UIContainer = require('../../containers/UIContainer');

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

    var UIImageIcon = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            // Define property to check the state of the button

            // Set user defined style or defaults
            this._size = options.iconSize || [48,48];
            this._boxColor = this.options.boxColor || 'blue';
            this.setSize(this._size);
            this._iconName = options.iconName;

            // We create our box with the necessary style and add it to ourself
            this._createBackground();
            this._createImageBox();

        },

        /**
         * Created check box
         *
         * @protected
         * @method _createBox
         */
        _createImageBox: function (){
            this._iconContainer = new UIContainer({
                size : this._size,
            });
            this._imageBox = new UIElement({
                size: this._size,
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                content : "<img src="+this._iconName+" style='width:100%; height:100%;'>"
            });
            this._iconContainer.addChild(this._imageBox);
            this._addChild(this._iconContainer);
        },

        /**
         * Creates the checkbox bacground
         *
         * @protected
         * @method _createCheckBoxBackground
         */
        _createBackground: function (){
            this._backgroundElement = new UIElement({
                size: this._size,
                opacity: '1',
            });
            this._addChild(this._backgroundElement.center());
        },
        /**
         *  Animate the Icon on mouseover event
         * @public
         * @method setPressed
         */
        setPressed : function (pressed, animate) {
            // Background flashes on click

        },
        /**
         *  Animate the Icon on setSelected event
         * @public
         * @method setSelected
         */

        setSelected: function(select,animate){
            this._selected = select;
         }

    });

    module.exports = UIImageIcon;
});
