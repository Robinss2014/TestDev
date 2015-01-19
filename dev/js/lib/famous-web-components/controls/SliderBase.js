define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement = require('../core/UIElement');
    var Utils = require('../utils/Utils');
    var Easing = require('famous/transitions/Easing');

    var eventMap = { 
        0: 'clientX',
        1: 'clientY'
    }

    var SliderBase = UIComponent.extend({ 
        /**
         * Base Slider class to inherit from. Sets up the event container
         *
         * @class SliderBase
         * @extends UIComponent
         * @param [options] a set of configurable options
         * @param [options.direction] {Number} Valid options are 0 for 'x', or 1 for 'y'.
         * @param [options.range] {Array | 2D} Min and max values for the slider.
         * @param [options.precision] {Number}
         *  Constrain the valid values to numbers that are divisible by this number.
         *  For example, with a range of [0, 10], and a precision of 5, valid numbers will be 0, 5, and 10.
         */
        constructor: function SliderBase (options) {
            this._callSuper(UIComponent, 'constructor', options);

            this._value = this.options.defaultValue;
            if (this._value > this.options.range[1]) this._value = this.options.range[1];

            this._eventContainer;

            this._size = this.options.size;
            this._pos; // offset from top left corner
            this._pixelPos = this._size[this.options.direction] * this.getPercentage(); // current pixel position
            this._oppositeDir = this.options.direction == 0 ? 1 : 0;
            this._lastValue;

            this._init();
        },
        defaults: {
            direction: 0,
            range: [0, 10],
            size: [150, 20],
            precision: undefined,
            onChange: undefined,
            defaultValue: 10
        },

        /**
         *  @deprecated
         *  Set the slider to the desired value
         *  @method set
         *  @param val {Number} Value to the slider to.
         */
        set: function (val) {
            this.setValue(val);
        },

        /**
         *  Set the slider to the desired value
         *  @method setValue
         *  @param val {Number} Value to the slider to.
         */
        setValue: function (val, forceEmit) {
            val = this._applyPrecision(val);
            this._value = Math.min(Math.max(this.options.range[0], val), this.options.range[1]);
            this._pixelPos = this.getPercentage() * this._size[this.options.direction];
            this._update(this._value);
            if (this._value !== this._lastValue) {
                if (forceEmit) this.emit('change', this._value);
                if (forceEmit && this.options.onChange) this.options.onChange(this._value);
            }
            return this;
        },
        /**
         * Set the precision value, after the slider has been instantiated.
         * @method setPrecision
         * @param precision
         */
        setPrecision : function (precision) {
            this.options.precision = precision;
            return this;
        },

        /**
         *  @deprecated -- getValue instead
         *  @method get
         *  @return {Number} current value
         */
        get: function () {
            return this._value;
        },

        /**
         *  @method getValue
         *  @return {Number} current value
         */
        getValue: function () {
            return this.get();
        },

        /**
         * @method getPercentage
         */
        getPercentage : function () {
            return (this._value - this.options.range[0]) / (this.options.range[1] - this.options.range[0]);
        },
        /**
         *  Set the size of a slider.
         *  @method setSize
         *  @param size {Array | 2D}
         */
        setSize: function (size) {
            this._size = size;
            this._callSuper(UIComponent, 'setSize', size);
            if (this._eventContainer) this._eventContainer.setSize(size);
        },
        /**
         *  Destroy the slider, removing all references
         *  @method destroy
         */
        destroy: function () {
            this._unbindListeners();
            this._eventContainer.destroy();
        },

        /**
         * To be overwritten in child classes.
         * @method _update
         * @private
         */
        _update : function () { },

        /**
         *  @method _init
         *  @protected
         */
        _init: function () {
            this._eventContainer = new UIElement({
                style: {
                    zIndex: 10
                },
                size: this._size,
                classes: ['ui-event-container'],
                opacity: 0
            });

            this._addChild(this._eventContainer);
            this._bindListeners();
        },
        // Event Listeners
        /**
         *  @method _bindListeners
         *  @protected
         */
        _bindListeners: function () {
            this._boundOnStart = this._onStart.bind(this);
            this._boundOnUpdate = this._onUpdate.bind(this);
            this._boundOnEnd = this._onEnd.bind(this);
            this._eventContainer.on('dragStart', this._boundOnStart);
            this._eventContainer.on('dragUpdate', this._boundOnUpdate);
            this._eventContainer.on('dragEnd', this._boundOnEnd);
        },
        /**
         *  @method _unbindListeners
         *  @protected
         */
        _unbindListeners: function () {
            this._eventContainer.off('dragStart', this._boundOnStart);
            this._eventContainer.off('dragUpdate', this._boundOnUpdate);
            this._eventContainer.off('dragEnd', this._boundOnEnd);
        },
        /**
         *  @method _onStart
         *  @protected
         */
        _onStart: function (e) {
            this._needsAnim = true;
            this._updatePosition();
            this._onUpdate(e);
            this.emit('dragStart');
        },
        /**
         *  @method _onUpdate
         *  @protected
         */
        _onUpdate: function (e) {
            this._lastValue = this.get();
            var sizePos = Utils.clamp(
              e[eventMap[this.options.direction]] - this._pos[this.options.direction],
              0, this._size[this.options.direction]);

            this.setValue(Utils.map(sizePos, 0, this._size[this.options.direction], this.options.range[0], this.options.range[1]), true);

            this._needsAnim = false;
        },
        /**
         *  @method _onEnd
         *  @protected
         */
        _onEnd: function (e) {
            this._onUpdate(e);
            this.emit('dragEnd');
        },
        /**
         * @method _updatePosition
         * @protected
         */
        _updatePosition: function () {
            this._pos = this.getWorldPosition();
        },
        /**
         * @method _applyPrecision
         * @private
         */
        _applyPrecision: function (val) {
            if (this.options.precision !== undefined) {
                val = Math.round(val / this.options.precision) * this.options.precision;
            }
            return val;
        },

    });

    module.exports = SliderBase;
});
