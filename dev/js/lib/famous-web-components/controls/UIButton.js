define(function(require, exports, module) {
  var UIButtonBase       = require('./buttonClasses/UIButtonBase');
  var UIButtonBackground = require('./buttonClasses/UIButtonBackground');

 /**
  * A button class
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
  *  var button = new UIButton({
  *      size: [200, 50],
  *      text: 'I am a Button',
  *      iconPlacement: 'left'
  *  });
  *
  * @class UICheckBox
  * @constructor
  */
  var UIButton = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
        _paddingLeft:10,
        _paddingRight:10,
        _backgroundSkin: UIButtonBackground,
        _contentAlign: 'center', 
        _labelClasses: ['button-label'],
        _backgroundClasses: ['button-background'],

        constructor: function(options) {
            this._callSuper(UIButtonBase, 'constructor', options);
        },

        _createBackground : function () {
            if (this._backgroundSkin) {
                return new this._backgroundSkin({
                    style:this._backgroundStyle,
                    classes: this._backgroundClasses,
                    zIndex : this._zIndex
                });
            }
        },
        //@@
        _createIcon : function () {
            if (this._iconSkin){
                return new this._iconSkin({
                    zIndex : this._zIndex+10,
                });
            }
        },

      });

  module.exports = UIButton;

});
