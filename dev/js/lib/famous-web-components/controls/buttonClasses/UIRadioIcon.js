define(function(require, exports, module) {
    var UIBase = require('../../core/UIBase');
    var UIComponent = require('../../core/UIComponent');
    var UIElement = require('../../core/UIElement');
    var Transform = require('famous/core/Transform');
    var Easing = require('famous/transitions/Easing');
    var UIBoundingBox = require('../UIBoundingBox');

    var UIRadioIcon = UIComponent.extend( /** @lends UIComponent.prototype */ {
        /**
         * A radio button
         *
         * @name UIRadioIcon
         * @constructor
         *
         * @param {Object} [options] options to be set on UIRadioIcon
         * @param {String} [options.size] radio button size
         * @param {String} [options.color] button's on color
         * @param {String} [options.ringColor] ring color
         * @param {String} [options.fillColor] fill color
         */
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            // User options are entered else defaults are assigned
            options             = options           || {};
            this._size          = options.size      || [48, 48]; // TODO: keep track of size using UIBase setSize and getSize instead of here.
            this.color          = options.color     || 'green';
            this.ringColor      = options.ringColor || 'gray';
            this.fillColor      = options.fillColor || this.color;

            this.setSize(this._size[0], this._size[1]);

            // Layout style assigned
            this._ringSize      = this._fillSize = [this.getSize()[0]/3, this.getSize()[1]/3];

            // Define property to check the state of the button
            this._isRadioBeingAnimated = false;

            // We create everything necessary for our RadioButton
            this._createBackground();
            this._createRing();
            this._createFill();
            this._createBoundingBox();
        },

        /**
         * Sets the selected state of the checkbox icon. Selected means it's checked.
         *
         * @method setSelected
         *
         * @param {boolean} value Whether this is selected.
         * @param {boolean} animate Whether to animate to this state.
         */
        setSelected: function(value, animate) {
            this._selected = value;
            this._fill.halt();
            this._fill.setScale(~~this._selected, ~~this._selected, 1, { duration: (animate? 200 : 0), curve: 'outCubic' });
        },

        /**
         * Sets the enabled state of the checkbox icon. Not enabled means it looks like it cannot be interacted with.
         *
         * @method setSelected
         *
         * @param {boolean} value Whether this is selected.
         * @param {boolean} animate Whether to animate to this state.
         */
        setEnabled: function(value, animate) {
            this._enabled = value;
            // TODO
        },

        /**
         * Sets the pressed state of the checkbox icon. Pressed is when the button is pressed down.
         *
         * @method setSelected
         *
         * @param {boolean} value Whether this is selected.
         * @param {boolean} animate Whether to animate to this state.
         */
        setPressed: function(value, animate) {
            this._pressed = value;
            if (this._pressed) {
                this.showBackground(animate);
            }
            else {
                this.hideBackground(animate);
            }
        },

        /**
         * Creates radio button background
         *
         * @protected
         * @method _createBackground
         */
        _createBackground: function() {
            this._buttonBackground = new UIElement({
                size: this.getSize(),
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                opacity: 0,
                style: {
                    borderRadius: '50%',
                    background: this.color,
                }
            });
            this._addChild(this._buttonBackground);

        },

        /**
         * Creates ring around radio button
         *
         * @protected
         * @method _createRing
         */
        _createRing: function (){
            this._ring = new UIElement({
                size: this._ringSize,
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                style: {
                    border: '2px solid black',
                    borderColor: this.ringColor,
                    borderRadius: '50%'
                }
            });
            this._addChild(this._ring);
        },

        /**
         * Creates fill inside of ring
         *
         * @protected
         * @method _createFill
         */
        _createFill: function (){
            this._fill = new UIElement({
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                size: this._fillSize,
                style: {
                    backgroundColor: this.color,
                    borderRadius: '50%'
                },
                transform: Transform.scale(0,0,1)
            });
            this._addChild(this._fill);
        },

        /**
         * Creates the bounding box that handles all the click events
         *
         * @protected
         * @method _createBoundingBox
         */
        _createBoundingBox: function(){
            this._boundingBox = new UIBoundingBox();
            this._addChild(this._boundingBox);
        },

        /**
         * Shows the background.
         *
         * @method toggle
         */
        showBackground: function(animate) {
            this._buttonBackground.halt();
            this._buttonBackground.setOpacity(0.2, { duration : (animate? 80 : 0), curve: 'outBack' });
            this._buttonBackground.setScale(1,1,1, { duration : (animate? 200 : 0), curve: 'outBack' });
        },

        /**
         * Hides the background.
         *
         * @method toggle
         */
        hideBackground: function(animate) {
            this._buttonBackground.halt();
            this._buttonBackground.setOpacity(0, { duration : (animate? 200 : 0), curve: 'outBack' });
            this._buttonBackground.setScale(0,0,1, { duration : (animate? 200 : 0), curve: 'outBack' });
        }

    });

    module.exports = UIRadioIcon;
});
