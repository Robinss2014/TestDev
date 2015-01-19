define(function(require, exports, module) {

    /**
     * @method extend
     * @param a
     * @param b
     */
    function extend (a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    }

    /**
     * @method merge
     */
    function merge(a, b) {
        var c = {};
        for (var i = 0; i < arguments.length; i++) {
            extend(c, arguments[i]);
        };
        return c;
    }

    var Utils = { 
        /**
         * @method clamp
         * @param v
         * @param min
         * @param max
         */
        clamp: function clamp (v, min, max) {
            if (v < min) {
                return min;
            }
            else if (v > max) {
                return max;
            }
            else {
                return v;
            }
        },
        /**
         * @method map
         * @param value
         * @param inputMin
         * @param inputMax
         * @param outputMin
         * @param outputMax
         */
        map: function map (value, inputMin, inputMax, outputMin, outputMax) {        	
            return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
        },
        extend: extend,
        merge: merge
    }

  module.exports = Utils;
});
