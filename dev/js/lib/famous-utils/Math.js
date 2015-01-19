define(function(require, exports, module) {  
  var MathUtils = { 

      /**
       *  @method r2d
       *  @param radians {number} Radians to convert to degrees.
       *  @returns {number} Degrees.
       */
      r2d: function r2d (radians) {
          return radians * 180 / Math.PI;
      },
      /**
       *  @method d2r
       *  @param radians {number} Degrees to convert to radians.
       *  @returns {number} Radians.
       */
      d2r: function d2r (deg) {
          return deg * Math.PI / 180;
      },
      /**
       *  Calculates the 3D distance between two 3D points.
       *
       *  @method distance3D
       *  @returns {number} 3D distance.
       */
      distance3D: function distance3D (x1, y1, z1, x2, y2, z2)
      {
          var deltaX = x2 - x1; 
          var deltaY = y2 - y1; 
          var deltaZ = z2 - z1; 
          return Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ); 
      },
      /**
       *  Rounds a given value by the given roundedBy value.
       *  @example
       *    var a = FamousUtils.roundBy(19, 10)
       *    a == 20; // true
       *    var b = FamousUtils.roundBy(12, 10)
       *    b == 10; // true
       *
       *  @method d2r
       *  @param radians {number} Degrees to convert to radians.
       *  @returns {number} Radians.
       */
      roundBy: function roundBy (val, roundedBy) {
          return roundedBy * Math.round(val / roundedBy);
      },

      /**
       *  @static
       *  @method clamp
       *  @param v {Number} Value to clamp
       *  @param min {Number} Min to cap value.
       *  @param max {Number} Max to cap value.
       */
      clamp: function clamp (v, min, max) {
          if (v < min) return min;
          else if (v > max) return max;
          else return v;
      },

      /**
       * @method map
       * @param value {Number} Value to map
       * @param inputMin {Number} incoming min range
       * @param inputMax {Number} incoming max range
       * @param outputMin {Number} shifted output minimum range to map value to.
       * @param outputMax {Number} shifted output maxium range to map value to.
       */
      map : function map (value, inputMin, inputMax, outputMin, outputMax) {
          return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
      }
          
  }
  module.exports = MathUtils;
});
