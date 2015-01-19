define(function(require, exports, module) {
    var SliderBase = require('../controls/SliderBase')
    var UIElement = require('../core/UIElement');
    var UIIconSlider = require('../controls/UIIconSlider');
    var Utils = require('../utils/Utils');

    var UIDashIconSlider = UIIconSlider.extend({ 
        /**
         * @method constructor
         * @param options
         * @property defaults
         * @param {defaults} An object.
         * @param {number} [defaults.dashWidth]
         * @param {undefined} [defaults.dashHeight]
         * @param {object} [defaults.dashProperties]
         * @param {number} [defaults.dashDelay]
         * @param {object} [defaults.dashTransition]
         */
        constructor : function (defaults) {
            this.defaults = Utils.merge(this.defaults, UIIconSlider.prototype.defaults);
            this._callSuper(UIIconSlider, 'constructor', defaults);
            this._dashes = [];
            this._dashPool = [];
            this._initDash();
        },
        defaults: {
            dashWidth: 2,
            dashHeight: undefined,
            dashProperties: {
                backgroundColor: '#b5b5b5',
                zIndex: -1
            },
            dashDelay: 150,
            dashTransition: {
                curve: 'outExpo',
                duration: 400
            }
        },
        /**
         * @method setPrecision
         * @param precision
         */
        setPrecision: function (precision) {
            this._callSuper(UIIconSlider, 'setPrecision', precision);
            var dashScale = this.options.direction == 0 ?
                [1, 0, 1] : [0, 1, 1];
            for (var i = 0; i < this._dashes.length; i++) {
                var cb = i === this._dashes.length - 1 ? this._resetDashes.bind(this) : undefined;
                this._dashes[i].setDelay(i * this.options.dashDelay);
                this._dashes[i].setScale(dashScale, this.options.dashTransition, cb);
            };
        },

        /**
         * @method _initDash
         * @private
         */
        _initDash : function (values) {
            this._dashValues = values ? values : this._getValues();
            var dashSize = this._getDashSize();
            var dashScale = this.options.direction == 0 ?
                [1, 0, 1] : [0, 1, 1];
            var align = this.options.direction == 0 ?
                [0, 0.5] : [0.5, 0];

            for (var i = 0; i < this._dashValues.length; i++) {
                if (!this._dashes[i]) {
                    var dashElement = new UIElement({
                        size: dashSize,
                        style: this.options.dashProperties,
                        origin: [0, 0.5],
                        align: align,
                        position: this._getDashPosition(i / (this._dashValues.length - 1)),
                        scale: dashScale
                    });
                    this._dashes.push(dashElement);
                } else {
                    var dashElement = this._dashes[i];
                    dashElement.setPosition(this._getDashPosition(i / (this._dashValues.length - 1)));
                    dashElement.setScale(dashScale);
                }
                this._addChild(dashElement);
                dashElement.setDelay(i * this.options.dashDelay);
                dashElement.setScale([1,1,1], this.options.dashTransition);
            };
        },
        /**
         * @method _resetDashes
         * @private
         */
        _resetDashes: function () {
            var lastValueLength = this._dashValues.length;
            var newValues = this._getValues();
            if (lastValueLength > newValues.length) {
                for (var i = newValues.length; i < lastValueLength; i++) {
                    this._removeChild(this._dashes[i]);
                };
            }
            this._initDash(newValues);
        },

        /**
         * @method _getValues
         * @private
         */
        _getValues : function () {
            var vals = [];
            if (!this.options.precision) return vals;
            var inRange = true;
            var currentValue = this.options.range[0];
            vals.push(currentValue);
            while (inRange) {
                currentValue += this.options.precision;
                if ( currentValue <= this.options.range[1]) {
                    vals.push(currentValue);
                }
                else {
                    inRange = false;
                }
            }
            return vals;
        },
        /**
         * @method _getDashSize
         * @private
         */
        _getDashSize : function () {
            return this.options.direction == 0 ?
                [this.options.dashWidth, this.options.dashHeight ? this.options.dashHeight : this._size[1]]:
                [this.options.dashHeight ? this.options.dashHeight : this._size[0], this.options.dashWidth];
        },
        /**
         * @method _getDashPosition
         * @private
         * @param percentage
         */
        _getDashPosition : function (percentage) {
            var pos = [0,0,0];
            pos[this.options.direction] = percentage *
                (this.options.size[this.options.direction] - this.options.dashWidth);
            return pos;
        },
    });

    module.exports = UIDashIconSlider;

});
