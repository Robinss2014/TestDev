define(function(require, exports, module) {
  var UIButtonBase          = require('./UIButtonBase');
  var UIBackground    = require('./button/UIBackground');
  var UIIconElement         = require('./button/IconElement');
  // var ShinnyButtonIcon      = require('./button/ShinnyButtonIcon');

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
  var UIIconButton = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
        constructor: function(options) {
            options = options || {};
            options.text = ' ';
            this._size = options.size = options.size || [48,48];
            options.raised = true;
            options.background = "#455354"
            this._fontSize = options.size[0];
            this._borderRadius = options.size[0]/2;
            this._iconClass = options.icon;
            this._callSuper(UIButtonBase, 'constructor', options);
        },
        _createBackground : function () {
          return new UIBackground({
                size : this._size,
                background : this._background,
                borderRadius : 24,
                raised : this._raised,
                boxShadow : this._boxShadow

          });

        },
        _createIcon : function () {
            return new UIIconElement({
                size : this._size,
                icon : this._iconClass,
                fontSize : this._fontSize,
            });
        }

      });

  module.exports = UIIconButton;

});
