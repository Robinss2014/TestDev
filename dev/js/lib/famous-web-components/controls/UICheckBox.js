define(function(require, exports, module) {
  var UIButtonBase          = require('./buttonClasses/UIButtonBase');
  var UICheckBoxIcon        = require('./buttonClasses/UICheckBoxIcon');

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
  var UICheckBox = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
        // Check box is a toggleable button type
        _toggle: true,
        _iconPadding: 10,
        _text: 'CheckB0x',
        _iconSkin: UICheckBoxIcon,
        _boxColor: '#EAEAEA',
        _checkColor: '#EAEAEA',

        constructor: function(options) {
            this._callSuper(UIButtonBase, 'constructor', options);
            this.setSelected(options.selected);
        },
        _createIcon : function () {
            return new this._iconSkin({
                boxColor:this._boxColor,
                checkColor:this._checkColor
            });
        },

        _createBackground : function() {
            return null;
        }

      });

  module.exports = UICheckBox;

});
