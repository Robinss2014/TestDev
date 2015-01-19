define(function(require, exports, module) {  
  var Utility = require('famous/utilities/Utility');
  var ObjectUtils = {};

  /**
   *  Simple, one level deep object extension. Values in object b
   *  overwrite values in object A.
   *
   *  @method extend
   *  @param a {Object} Base Object
   *  @param b {Object} Object to add onto Base Object.
   */
  ObjectUtils.extend = function extend (a, b) {
      for (var key in b) {
          a[key] = b[key];
      }
      return a;
  }

  /**
   *  Merge all incoming objects into a completely new object.
   *  @method merge
   *  @param *objects {Object}
   */
  ObjectUtils.merge = function (/** args*/) {
      var c = {};
      for (var i = 0; i < arguments.length; i++) {
          ObjectUtils.extend(c, arguments[i]);
      };
      return c;
  }

  /**
   *
   * @method inherits
   */
  ObjectUtils.inherits = function(ctor, superCtor) {
    ctor.prototype = Object.create(superCtor.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.__super = superCtor.prototype;
  };

  /**
   *  @method inheritOptions 
   */
  ObjectUtils.inheritOptions = function (parentObj, childObj) {
      return ObjectUtils.extend(ObjectUtils.clone(parentObj), childObj); 
  }

  /*
   *  Deep clone an object.
   *  @param b {Object} Object to clone
   *  @return a {Object} Cloned object.
   */
  ObjectUtils.clone = Utility.clone;

  module.exports = ObjectUtils;
});
