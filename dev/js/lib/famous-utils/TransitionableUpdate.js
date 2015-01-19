define(function(require, exports, module) {  
  var Transitionable = require('famous/transitions/Transitionable');
  var Timer = require('famous/utilities/Timer');

  /**
   *   Turns a transitionable into a push-based callback, instead of a pull.
   *
   *   @example
   *      var trans = new TransitionableUpdate(0, function (value) {
   *          console.log('updated value: ', value);
   *      });
   *
   *      trans.set(1, { duration: 1000 }, function () {
   *          console.log('transition completed');
   *      });
   *
   *   @class TransitionableUpdate
   *   @param value {number|array} initial value of the callback
   *   @param updateCallback {function} callback function to call every tick.
   */
  function TransitionableUpdate (value, updateCallback) { 
      this._trans = new Transitionable(value);
      this._updateCallback = updateCallback;
      if (!this._updateCallback) throw new Error('No callback given');
      this._timer;
  }
  /**
   * @method get
   */
  TransitionableUpdate.prototype.get = function () {
      return this._trans.get.apply(this._trans, arguments);
  }

  /**
   * Set the transitionable
   * @method set
   * @param endState {number | array}
   * @param transition {transition definition}
   * @param callback {function}
   */
  TransitionableUpdate.prototype.set = function (endState, transition, callback) {
      if (transition) {
          var cb = function (callback) {
              this._removeTimer();
              if (callback) callback();
          }.bind(this, callback);
          this._startTimer();
      }

      return this._trans.set.call(this._trans, endState, transition, cb);
  }

  /**
   * @method _startTimer
   * @protected
   */
  TransitionableUpdate.prototype._startTimer = function () {
      var self = this;
      if (!this._timer) {
          this._timer = Timer.every(function () {
              self._updateCallback(self.get());
          });
      };
  }

  /**
   * @method _removeTimer
   * @protected
   */
  TransitionableUpdate.prototype._removeTimer = function () {
      if (this._timer) {
          Timer.clear(this._timer);
          this._timer = undefined;
      }
  }

  /**
   * @method halt
   */
  TransitionableUpdate.prototype.halt = function () {
      return this._trans.halt.apply(this._trans, arguments);
  }

  /**
   * @method delay
   */
  TransitionableUpdate.prototype.delay = function () {
      return this._trans.delay.apply(this._trans, arguments);
  }

  module.exports = TransitionableUpdate;
});
