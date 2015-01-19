define(function(require, exports, module) {
    var SliderBase = require('./SliderBase')
    var UIElement = require('../core/UIElement');
    var Utils = require('../utils/Utils');

    var IconSlider = SliderBase.extend({ 
        /**
         * @method constructor
         * @param options
         */
        constructor: function IconSlider (options) {
            this.defaults = Utils.merge(SliderBase.prototype.defaults, this.defaults);
            this._callSuper(SliderBase, 'constructor', options);
            this._fill;
            this._fillBg;
            this._icon;

            this._initIconSlider();
        },

        /**
         * @property defaults
         * @param {defaults} An object.
         * @param {number} [defaults.fillSize]
         * @param {object} [defaults.fillClasses]
         * @param {object} [defaults.fillStyle]
         * @param {object} [defaults.fillBgClasses]
         * @param {object} [defaults.fillBgStyle]
         * @param {object} [defaults.iconStyle]
         * @param {object} [defaults.iconClasses]
         * @param {object} [defaults.iconTransition]
         */
        defaults: {
            fillSize: 5,
            fillClasses: [],
            fillStyle: {
                'backgroundColor': '#404040',
            },
            fillBgClasses: [],
            fillBgStyle: {
                'backgroundColor': '#b5b5b5',
            },
            iconStyle: {
                'borderRadius': '50%',
                'backgroundColor' : '#404040'
            },
            iconClasses: [],
            iconTransition: {
                curve: 'outExpo',
                duration: 150
            }
        },

        /**
         * @method _initIconSlider
         * @private
         */
        _initIconSlider: function () {
            this._fillBg = new UIElement({
                style: this.options.fillBgStyle,
                classes: this.options.fillBgClasses,
                position: this._getFillPosition(),
            });

            this._fill = new UIElement({ 
                style: this.options.fillStyle,
                classes: this.options.fillClasses,
                position: this._getFillPosition(),
                scale: this._getFillScale()
            });
            this._icon = new UIElement({
                classes: this.options.iconClasses,
                style: this.options.iconStyle
            });
            this.setSize(this._size);
            this._icon.setPosition(this._getIconPosition())
            this._addChild(this._icon);
            this._addChild(this._fill);
            this._addChild(this._fillBg);
        },

        /**
         * @method _update
         * @private
         */
        _update: function (val) {
            var transition = this._needsAnim || (this.options.precision && this._lastValue !== this._value) ?
                this.options.iconTransition : null;

            if (this.options.precision) { 
                if (this._lastValue == this._value) return;
                else {
                    this._icon.halt();
                    this._fill.halt();
                }
            }

            this._icon.setPosition(this._getIconPosition(), transition);
            this._fill.setScale(this._getFillScale(), transition);
        },

        /**
         * @method setSize
         * @param size
         */
        setSize: function (size) {
            this._callSuper(SliderBase, 'setSize', size);
            if (!this._fill) return;

            var fillSize = this.options.direction == 0 ? 
                [this._size[0], this.options.fillSize] :
                [this.options.fillSize, this.options.size[1]] ;

            var iconSize = this.options.direction == 0 ?
                [this._size[1], this._size[1]]:
                [this._size[0], this._size[0]];

            this._fill.setSize(fillSize);
            this._fillBg.setSize(fillSize);
            this._icon.setSize(iconSize);
        },

        /**
         * @method _getFillPosition
         * @private
         */
        _getFillPosition : function () {
            var pos = [0,0,0];
            if (this.options.direction == 0) {
                pos[1] = (this._size[1] - this.options.fillSize) * 0.5
            }
            else {
                pos[0] = (this._size[0] - this.options.fillSize) * 0.5
            }
            return pos;
        },
        /**
         * @method _getFillScale
         * @private
         */
        _getFillScale : function () {
            var scale = [0,0,1];
            scale[this.options.direction] = Math.min(1, this.getPercentage());
            scale[this._oppositeDir] = 1;
            return scale;
        },
        /**
         * @method _getIconPosition
         * @private
         */
        _getIconPosition : function () {
            var pos = [0,0,0];
            pos[this.options.direction] = Utils.map(
                this._pixelPos,
                0, this._size[this.options.direction],
                0, this._size[this.options.direction] - this._icon.getSize()[this.options.direction]
            );
            return pos;
        },
    });

    module.exports = IconSlider;
});
