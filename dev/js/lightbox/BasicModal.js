define(function(require, exports, module) {

    var RenderNode = require('famous/core/RenderNode');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var Scrollview = require('famous/views/Scrollview');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var Utility = require('famous/utilities/Utility');

    /*
     *  BasicModal...
     *
     *  @class BasicModal
     */
    function BasicModal() {
        View.apply(this, arguments);

        // Properties
        this._data = {}; // Store data
        this._frontItemSize = this.options.frontItemSize;
        this._backItemSize = this.options.backItemSize;
        this._maxSize = this.options.maxSize;

        this._init();
    }

    BasicModal.DEFAULT_OPTIONS = {
        frontItemSize: [100, 100],
        backItemSize: [100, 100],
        maxSize: [640 * 2, 480 * 2]
    };

    BasicModal.prototype = Object.create(View.prototype);
    BasicModal.prototype.constructor = BasicModal;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    BasicModal.prototype.setFrontContent = function setFrontContent(data) {
        this._frontSurface.setContent(data.content);
        this._frontSurface.setProperties(data.properties);
        this._frontSurface.setProperties({zIndex: 10});
    }

    BasicModal.prototype.setBackContent = function setBackContent(data) {
        if (data.index === this._data.index) return;
        this._backTextSurf.setContent(data.content.backfaceData.split(' ')[1]);
        this._backTextSurf.setProperties({
            fontSize: this._backItemSize[0] * 0.35 + 'px',
        });

        var height = this._backSurface.getSize()[1];
        this._backTextOffset.set(height * 0.15);

        this._backSurface.setProperties({
            backgroundColor: data.properties.backgroundColor,
        });
    }

    BasicModal.prototype.animateIn = function animateIn(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;

        this._halt();

        // Update zIndex/zTranslate of front surface to avoid clipping
        this._frontSurface.setProperties({properties: {zIndex: 10}});
        this._frontTrans.setTranslate([0, 0, 10]);

        this._frontTrans.setRotate([0, Math.PI * direction, 0], rotateTrans);
        var backRotation = (direction === 1) ? Math.PI * 2 : 0;
        this._backTrans.setRotate([0, backRotation * direction, 0], rotateTrans);

        // Scale size to back size
        this._frontScale.set(this._frontToBackScale, sizeTrans);
        this._backScale.set([1, 1], sizeTrans);

        this._backTextOpacity.set(1);
    }

    BasicModal.prototype.animateOut = function animateOut(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;

        this._halt();

        this._frontTrans.setRotate([0, 0, 0], rotateTrans);
        this._backTrans.setRotate([0, Math.PI, 0], rotateTrans);

        // Scale size to front size
        this._frontScale.set([1, 1], sizeTrans);
        this._backScale.set(this._backToFrontScale, sizeTrans);

        this._backTextOpacity.set(0, {duration: 250});
    }

    BasicModal.prototype.setFrontItemSize = function setFrontItemSize(size) {
        this._frontItemSize = size.slice();
        this._frontMod.setSize(this._frontItemSize);
        this._setScaleRatios();
    }

    BasicModal.prototype.setBackItemSize = function setBackItemSize(size) {
        this._backItemSize = size.slice();
        this._backTextSurf.setProperties({
            fontSize: this._backItemSize[0] * 0.35 + 'px',
        });
        this._backMod.setSize(this._backItemSize);
        this._setScaleRatios();
    }


///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    BasicModal.prototype._init = function _init() {
        this._setScaleRatios();
        this._addFrontFace();
        this._addBackFace();
    }

    BasicModal.prototype._setScaleRatios = function _setScaleRatios() {
        this._frontToBackScale = [
            this._backItemSize[0] / this._frontItemSize[0],
            this._backItemSize[1] / this._frontItemSize[1]
        ];

        this._backToFrontScale = [
            this._frontItemSize[0] / this._backItemSize[0],
            this._frontItemSize[1] / this._backItemSize[1]
        ];
    };

    BasicModal.prototype._addFrontFace = function _addFrontFace() {
        this._frontOpacity = new Transitionable(1);
        this._frontScale = new Transitionable([1, 1]);
        var scale;
        this._frontMod = new Modifier({
            size: this._frontItemSize,
            opacity: this._frontOpacity,
            transform: function (transform) {
                scale = this._frontScale.get();
                return Transform.scale(scale[0], scale[1], 1)
            }.bind(this),
            origin: [0, 0],
            align: [0, 0]
        });

        this._frontTrans = new TransTransform();
        this._frontRotationMod = new Modifier({
            transform: this._frontTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });

        this._frontSurface = new Surface();
        this.add(this._frontMod)
            .add(this._frontRotationMod)
            .add(this._frontSurface);
    };

    BasicModal.prototype._addBackFace = function _addBackFace() {
        // Add back face
        this._backScale = new Transitionable([1, 1]);
        var scale;
        this._backOpacity = new Transitionable(1);
        this._backMod = new Modifier({
            size: this._backItemSize,
            transform: function (transform) {
                scale = this._backScale.get();
                return Transform.scale(scale[0], scale[1], 1)
            }.bind(this),
            origin: [0, 0],
            align: [0, 0],
            opacity: this._backOpacity
        });

        this._backTrans = new TransTransform();
        this._backRotationMod = new Modifier({
            transform: this._backTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });
        this._backTrans.setRotate([0, Math.PI, 0]);
        this._backTrans.setTranslate([0, 0, 5]);

        var borderSize = this._backItemSize[1] > 300 ? 15 : 5;
        this._backSurface = new Surface({
            classes: ['item-back-view'],
            properties: {
                border: borderSize + 'px solid white'
            }
        });

        this._backTextSurf = new Surface({
            classes: ['item-back-view-text'],
            properties: {zIndex: 3}
        });

        this._backTextOffset = new Transitionable(0);
        this._backTextOpacity = new Transitionable(1);
        this._backTextMod = new Modifier({
            opacity: this._backTextOpacity,
            transform: function () {
                return Transform.translate(0, this._backTextOffset.get(), 5);
            }.bind(this)
        });

        var node = this.add(this._backMod).add(this._backRotationMod);
        node.add(this._backSurface);
        node.add(this._backTextMod).add(this._backTextSurf);
    }

    BasicModal.prototype._halt = function _halt(first_argument) {
        this._frontTrans.halt();
        this._backTrans.halt();
        this._backScale.halt();
        this._frontScale.halt();
        this._frontOpacity.halt();
    };

    module.exports = BasicModal;

});
