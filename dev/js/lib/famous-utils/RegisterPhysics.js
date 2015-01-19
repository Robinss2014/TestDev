define(function(require, exports, module) {  
  /***
   *   Helper require to register physics transitions globally in an application. 
   *   To use this, all you must do is require this in:
   *
   *   @example
   *      require('famous-utils/RegisterPhysics');
   *
   *  // Allows transitions as follows: 
   *  myModifier.setTransform(Transform.translate(200,200), {
   *    method: 'spring', // as a string.
   *    period: 500,
   *    dampingRatio: 0.25
   *  });
   *
   */
  var Transitionable   = require('famous/transitions/Transitionable');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var SnapTransition   = require('famous/transitions/SnapTransition');
  var WallTransition   = require('famous/transitions/WallTransition');

  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);
  Transitionable.registerMethod('wall', WallTransition);
});
