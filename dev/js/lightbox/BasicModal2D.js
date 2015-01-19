define(function(require, exports, module) {

    var BasicModal = require('./BasicModal');
    var Utility = require('famous/utilities/Utility');

    /*
     *  A simplified modal that doesn't have any 3D transformations.
     *  This modal is used for phones/tablets which exhibit serious clipping issues.
     *
     *  @class BasicModal2D
     */
    function BasicModal2D() {
        BasicModal.apply(this, arguments);
        this._backTrans.setRotate([0, 0, 0]); // Reset rotation
        this._backScale.set(this._backToFrontScale);
    }

    BasicModal2D.DEFAULT_OPTIONS = {};

    BasicModal2D.prototype = Object.create(BasicModal.prototype);
    BasicModal2D.prototype.constructor = BasicModal2D;

// Similar to 'inOutBack' but exagerates the anticipation/follow through
// even if the value being transitioned is very small.
    BasicModal2D.CUSTOM_CURVE = function (t, s) {
        if (s === undefined) s = 1.70158;
        if ((t /= .5) < 1) return .5 * (t * t * (((s *= (1.525 * 1200)) + 1) * t - s));
        return (.5 * ((t -= 2) * t * (((s *= (1.525 * 1200)) + 1) * t + s) + 2)) * 0.5;
    };

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////
    BasicModal2D.prototype.animateIn = function animateIn(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;
        var duration = rotateTrans.duration || rotateTrans.period || 1000;
        var transition = {duration: duration, curve: BasicModal2D.CUSTOM_CURVE};

        // Update zIndex/zTranslate of front surface to avoid clipping
        this._frontSurface.setProperties({properties: {zIndex: 10}});
        this._frontTrans.setTranslate([0, 0, 10]);

        this._frontTrans.setRotate([0, 0, 0]);
        this._backTrans.setRotate([0, 0, 0]);
        this._frontTrans.setRotate([0, 0, 0.001 * direction], transition);
        this._backTrans.setRotate([0, 0, 0.001 * direction], transition);

        this._frontOpacity.set(0, {curve: 'outExpo', duration: transition.duration * 0.3});
        this._backOpacity.set(1, {curve: 'outExpo', duration: transition.duration * 0.3});

        // Scale size to back size
        this._frontScale.set(this._frontToBackScale, sizeTrans);
        this._backScale.set([1, 1], sizeTrans);
    }

    BasicModal2D.prototype.animateOut = function animateOut(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;
        var duration = rotateTrans.duration || rotateTrans.period || 1000;
        var transition = {duration: duration, curve: BasicModal2D.CUSTOM_CURVE};

        this._frontTrans.setRotate([0, 0, 0]);
        this._backTrans.setRotate([0, 0, 0]);
        this._frontTrans.setRotate([0, 0, -0.001 * direction], transition);
        this._backTrans.setRotate([0, 0, -0.001 * direction], transition);

        this._frontOpacity.set(1, {curve: 'outExpo', duration: transition.duration * 0.3});
        this._backOpacity.set(0, {curve: 'outExpo', duration: transition.duration * 0.3});

        // Scale size to front size
        this._frontScale.set([1, 1], sizeTrans);
        this._backScale.set(this._backToFrontScale, sizeTrans);
    }


    module.exports = BasicModal2D;

});
