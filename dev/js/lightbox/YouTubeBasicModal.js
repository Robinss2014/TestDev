define(function(require, exports, module) {

    var YouTubeModal = require('./YouTubeModal');
    var Utility = require('famous/utilities/Utility');

    /*
     *  A simplified YouTube modal that doesn't have any 3D transformations.
     *  This modal is used for phones/tablets which exhibit serious clipping issues.
     *
     *  @class YouTubeBasicModal
     */
    function YouTubeBasicModal() {
        YouTubeModal.apply(this, arguments);
        this._backTrans.setRotate([0, 0, 0]); // Reset rotation
    }

    YouTubeBasicModal.DEFAULT_OPTIONS = {};

    YouTubeBasicModal.prototype = Object.create(YouTubeModal.prototype);
    YouTubeBasicModal.prototype.constructor = YouTubeBasicModal;

// Similar to 'inOutBack' but exagerates the anticipation/follow through
// even if the value being transitioned is very small.
    YouTubeBasicModal.CUSTOM_CURVE = function (t, s) {
        if (s === undefined) s = 1.70158;
        if ((t /= .5) < 1) return .5 * (t * t * (((s *= (1.525 * 1200)) + 1) * t - s));
        return (.5 * ((t -= 2) * t * (((s *= (1.525 * 1200)) + 1) * t + s) + 2)) * 0.5;
    };

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////
    YouTubeBasicModal.prototype.animateIn = function animateIn(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;
        var duration = rotateTrans.duration || rotateTrans.period || 1000;
        var transition = {duration: duration, curve: YouTubeBasicModal.CUSTOM_CURVE};
        var callback = Utility.after(5, this._addYoutubeIframe.bind(this));

        // Update zIndex/zTranslate of front surface to avoid clipping
        this._frontSurface.setProperties({properties: {zIndex: 10}});
        this._frontTrans.setTranslate([0, 0, 10]);

        this._frontTrans.setRotate([0, 0, 0]);
        this._backTrans.setRotate([0, 0, 0]);
        this._frontTrans.setRotate([0, 0, 0.001 * direction], transition, callback);
        this._backTrans.setRotate([0, 0, 0.001 * direction], transition, callback);

        this._frontOpacity.set(0, rotateTrans, callback);

        // Scale size to back size
        this._frontSize.set(this._backItemSize, sizeTrans, callback);
        this._backSize.set(this._backItemSize, sizeTrans, callback);
    }

    YouTubeBasicModal.prototype.animateOut = function animateOut(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;
        var duration = rotateTrans.duration || rotateTrans.period || 1000;
        var transition = {duration: duration, curve: YouTubeBasicModal.CUSTOM_CURVE};

        this._backSurface.setContent('');
        this._removeIframe();

        this._frontTrans.setRotate([0, 0, 0]);
        this._backTrans.setRotate([0, 0, 0]);
        this._frontTrans.setRotate([0, 0, -0.001 * direction], transition);
        this._backTrans.setRotate([0, 0, -0.001 * direction], transition);

        this._frontOpacity.set(1, rotateTrans);

        // Scale size to front size
        this._frontSize.set(this._frontItemSize, sizeTrans);
        this._backSize.set(this._frontItemSize, sizeTrans);
    }


    module.exports = YouTubeBasicModal;
});
