define(function(require, exports, module) {
  var UIComponent          = require('../../core/UIComponent');
  var UIElement          = require('../../core/UIElement');

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
  var UIPopUpButtonBGSkin = UIComponent.extend( /** @lends UIButtonBase.prototype */ {

        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            this._bg = new UIElement({
                style: {
                    borderRadius:'4px',
                    border: '1px solid #555',
                    backgroundColor: 'rgba(50,50,50,0.5)'
                },
                opacity:0
            });
            this._addChild(this._bg);
        },

        setSize: function(p_size) {
            this._bg.setSize(p_size);
            this._callSuper(UIComponent, 'setSize', p_size[0], p_size[1]);
        },

        revealBG: function() {
            this._bg.halt();
            this._bg.setOpacity(1, {duration:250});
        },

        hideBG: function() {
            this._bg.halt();
            this._bg.setOpacity(0, {duration:250});
        },


      });

  module.exports = UIPopUpButtonBGSkin;

});
