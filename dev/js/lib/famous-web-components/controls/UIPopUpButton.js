define(function(require, exports, module) {
  var UIButtonBase          = require('./buttonClasses/UIButtonBase');
  var UIElement          = require('../core/UIElement');
  var UIPopUpButtonBGSkin = require('./buttonClasses/UIPopUpButtonBGSkin');
  var UIComponenet = require('../core/UIComponent');

/**
     * A Check box button class
     *
     * @param {Object} [options] options to be applied to the button
     * @param {Array | Numbers} [options.size] Size of bounding box
     * @param {String} [options.text] Text to be set on label
     * @param {Boolean} [options.toggle] Toggle status
     * @param {Boolean} [options.enabled] Enabled status
     * @param {Selected} [options.selected] Selected status
     * @param {Number} [options.iconPadding] Padding between icon and label
     * @param {String} [options.iconPlacement] Placement of icon in bounding box
     *
     * @example
     *  var button = new UICheckBox({
     *      size: [200, 50],
     *      text: 'I am a checkbox',
     *      iconPlacement: 'left'
     *  });
     *
     * @class UICheckBox
     * @constructor
     */
  var UIPopUpButton = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
        _toggle: true,
        _iconPadding: 8,
        _iconPlacement:'right',
        _text: 'PopUp',
        _contentAlign:'center',

        constructor: function(options) {
            this._callSuper(UIButtonBase, 'constructor', options);

        },
        _createIcon : function () {
            this._iconElement = new UIElement(
            {
                size:[10, 17],
                content:'<img src="https://s3-us-west-1.amazonaws.com/demo.famo.us/november-demos/down_arrow.png"/>',
                origin: [0.5, 0.5],
                align: [0.5, 0.5]
            })

            var iconNode = new UIComponenet({
                size:[10, 17]
            });
            iconNode._addChild(this._iconElement);

            return iconNode;
        },

        _createBackground : function() {
            return new UIPopUpButtonBGSkin();
        },

        _onMouseover: function(event) {
            // TODO
            // this.emit('mouseover');
            this._backgroundElement.revealBG();
        },
        /**
         * @method _onMouseout
         * @private
         * @param event
         */
        _onMouseout : function (event) {
            // TODO
            // this.emit('mouseout');
            this._backgroundElement.hideBG();
        }


      });

  module.exports = UIPopUpButton;

});
