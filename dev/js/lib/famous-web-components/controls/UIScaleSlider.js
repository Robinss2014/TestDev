define(function(require, exports, module) {
    var SliderBase = require('./SliderBase')
    var UIElement = require('../core/UIElement');
    var Utils = require('../utils/Utils');

    var ScaleSlider = SliderBase.extend({ 
        /**
         * @method constructor
         * @param options
         */
        constructor: function ScaleSlider (options) {
            this.defaults = Utils.merge(SliderBase.prototype.defaults, this.defaults);
            this._callSuper(SliderBase, 'constructor', options);
            
            this._fill;
            this._fillBg;

            this._initScaleSlider();
        },
        
        /**
         * @property defaults
         * @param {defaults} An object.
         * @param {object} [defaults.fillClasses]
         * @param {object} [defaults.fillStyle]
         * @param {object} [defaults.fillBgClasses]
         * @param {object} [defaults.fillBgStyle]
         * @param {number} [defaults.defaultValue]
         * @param {object} [defaults.range]
         * @param {object} [defaults.size]
         */
        defaults: {
            fillClasses: ['ui-slider-fill'],
            fillStyle: {
                'backgroundColor': 'white',
                'zIndex': 2
            },
            fillBgClasses: ['ui-slider-fill-bg'],
            fillBgStyle: {
                'backgroundColor': 'grey',
                'zIndex': 0
            },
            defaultValue : 0,
            range: [0, 1],
            size: [150, 15],
            transition : { curve: 'outExpo', duration: 200 }
        },

        /**
         * @method _initIconSlider
         * @private
         */
        _initScaleSlider: function () {
            this._fillBg = new UIElement({
                style: this.options.fillBgStyle,
                classes: this.options.fillBgClasses
            });
            
            this._fill = new UIElement({ 
                style: this.options.fillStyle,
                classes: this.options.fillClasses,
            });

            this._addChild(this._fill);
            this._addChild(this._fillBg);

            this.setSize(this.options.size || this.defaults.size);
            this._update();
        },

        /**
         * @method setSize
         * @param size
         */
        setSize: function (size) {
            if(!this._fill || !this._fillBg) return;

            this._callSuper(SliderBase, 'setSize', this._getSliderSize(size));
            this._fill.setSize(this._getFillSize(size));
            this._fillBg.setSize(size);

            if(this._eventContainer) this._eventContainer.setSize(size);
        },

        /**
         * @method _update
         * @private
         */
        _update: function (val) {
            if(val == undefined) val = this.defaults.defaultValue;
            this._fill.halt();
            var transition = this._needsAnim || (this._lastValue !== this._value) ?
                (this.options.transition || this.defaults.transition) : null;
            
            //do not setScale if value did not change. 
            this._fill.setScale(this._getFillScale(), transition);
        },

        /**
         * @method _getFillScale
         * @private
         */
        _getFillScale : function () {
            var scale = [0,0,1];
            scale[this.options.direction] = Math.min(1, this.getPercentage());  //never go over 100%
            scale[this._oppositeDir] = 1;
            return scale;
        },

        /**
         * @method _getFillSize
         * @private
         */
        _getFillSize : function (size) {
            if(this.options.padding) {
                return [size[0] - this.options.padding[0], size[1] - this.options.padding[1]];
            }else{
                return size;
            }
        },

        /**
         * @method _getSliderSize
         * @private
         */
        _getSliderSize : function(size) {
            if(this.options.margin) {
                return [size[0] + this.options.margin[0], size[1] + this.options.margin[1]];
            }else{
                return size
            }
        }

    });

    module.exports = ScaleSlider;
});
