define(function(require, exports, module) {
    var UIElement = require('../core/UIElement');
    var Timer = require('famous/utilities/Timer');
    var Transform = require('famous/core/Transform');

    var TIMER_TRANSITIONS = {
        pulse: function () {
            var pos = this.getPosition();
            var scale = 1.4;
            var currSize = this.getSize();
            this.setTransform(Transform.moveThen([
                    pos[0] - (currSize[0] * scale - currSize[0]) * 0.5,
                    pos[1] - (currSize[1] * scale - currSize[1]) * 0.5,
                    pos[2],
                ], Transform.scale(scale, scale, 1))
            );
            this.setTransform(Transform.translate(pos[0], pos[1], pos[2]), this._transition); 
        }
    };

    /**
     *  @class UITimer
     *  @extends UIElement
     */
    var UITimer = UIElement.extend({ 
        _sampleRate: 2,
        _precision: 1,
        _style: {
            pointerEvents: 'none',
        },
        _classes: ['ui-timer'],
        _template: function (time) {
            return '<div class="ui-timer-number">' + time + '</div>';
        },
        _transition: {
            curve: 'outBack',
            duration: 400
        },
        _onSecondAnimation: 'pulse',

        /**
         *  @constructor
         */
        constructor: function UITimer (options) {
            if (!options) options = {};
            options.content = "0.0s";
            if (!options.style) options.style = this._style;
            if (!options.classes) options.classes = this._classes;
            this._callSuper(UIElement, 'constructor', options);
            this._applyOptions(options);

            this._update = this._update.bind(this);
            this._timer = undefined;
            this._active = false;
            this._startTime = undefined;
            this._lastSecond;
        },

        /**
         * Start the timer.
         * @method start
         */
        start: function () {
            this._startTime = Date.now();
            if (this._active) return;
            this._active = true;
            this._timer = Timer.every(this._update, this._sampleRate);
        },

        /**
         * Stop the timer.
         * @method stop
         */
        stop: function () {
            if (!this._active) return;
            this._active = false;
            if (this._timer) Timer.clear(this._timer);
        },

        /**
         * The updates triggered on every tick. Protected.
         * @method _update
         * @private
         */
        _update: function () {
            var currentTime = Date.now(); 
            var diff = currentTime - this._startTime;
            var text = this._diffToPrint(diff);
        },

        /**
         * Get stringified Diff.
         * @method _diffToPrint
         * @private
         * @param diff
         */
        _diffToPrint: function (diff) {
            var seconds = (diff / 1000) % 60;
            var minutes = ((diff / (1000 * 60)) % 60);
            var hours = ~~((diff / (1000 * 60 * 60)) % 60);

            var str;
            if (hours > 0) { 
                str = hours + ' hours';
            }
            else if (minutes > 1) {
                str = this._applyPrecision(minutes) + ' minutes';
            }
            else { 
                str = this._applyPrecision(seconds) + ' seconds';
            }
            this.setContent(this._template(str));
        },

        /**
         * @method _applyPrecision
         * @private
         * @param num
         */
        _applyPrecision: function (num) {
            var mult = Math.pow(10, this._precision);
            var a = (Math.round(num * mult) / mult);
            if (a % 1 === 0) {
                if (this._lastSecond !== a) {
                    this._lastSecond = a;
                    this._onSecond(a);
                }
                a += '.';
                for (var i = 0; i < this._precision; i++) a += '0';
            }
            return a; 
        },

        /**
         * @method _onSecond
         * @private
         * @param a
         */
        _onSecond: function (a) {
            if (a !== 0) {
                TIMER_TRANSITIONS[this._onSecondAnimation].call(this);
            }
        }
    });

    module.exports = UITimer;
}   );
