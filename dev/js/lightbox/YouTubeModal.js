define(function(require, exports, module) {

    var RenderNode = require('famous/core/RenderNode');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var Utility = require('famous/utilities/Utility');

    var Modal = require('./Modal');

    /*
     *  Modal componenet used for the YouTubeLightbox. This modal transitions using a
     *  three dimensional flip along the y-axis and loads a YouTube iFrame after the
     *  animation is complete.
     *
     *  @class YouTubeModal
     */
    function YouTubeModal() {
        Modal.apply(this, arguments);

        // Properties
        this._data = {}; // Store data
        this._iframeNodes = {}; // Store created iFrams
        this._frontItemSize = this.options.frontItemSize;
        this._backItemSize = this.options.backItemSize;
        this._maxSize = this.options.maxSize;

        // View scaffold
        this._frontSize;
        this._frontOpacity;
        this._frontMod;
        this._frontTrans;
        this._frontRotationMod;
        this._frontSurface;
        this._backSize;
        this._backMod;
        this._backTrans;
        this._backRotationMod;
        this._backNode;
        this._backSurface;

        this._init();
    }

    YouTubeModal.DEFAULT_OPTIONS = {
        frontItemSize: [100, 100],
        backItemSize: [100, 100],
        maxSize: [640 * 2, 480 * 2]
    };

    YouTubeModal.prototype = Object.create(Modal.prototype);
    YouTubeModal.prototype.constructor = YouTubeModal;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    YouTubeModal.prototype.setFrontContent = function setFrontContent(data) {
        this._frontSurface.setContent(data.content);
        this._frontSurface.setProperties(data.properties);
        this._frontSurface.setProperties({zIndex: 30});
    }

    YouTubeModal.prototype.setBackContent = function setBackContent(data) {
        if (data.index === this._data.index) return;
        this._data = data;
        this._backSurface.setContent('Loading...');
        this._backSurface.setProperties({
            backgroundColor: 'black',
            color: 'white',
            fontSize: '24px',
            weight: 'bold',
            textAlign: 'center',
            fontFamily: 'Arial',
            lineHeight: this._backItemSize[1] + 'px'
        });
    }

    YouTubeModal.prototype.animateIn = function animateIn(rotateTrans, sizeTrans, direction) {
        var callback = Utility.after(4, this._addYoutubeIframe.bind(this));

        direction = (direction === undefined) ? 1 : direction;

        this._halt();

        // Update zIndex/zTranslate of front surface to avoid clipping
        this._frontSurface.setProperties({properties: {zIndex: 10}});
        this._frontTrans.setTranslate([0, 0, 10]);

        this._frontTrans.setRotate([0, Math.PI * direction, 0], rotateTrans, callback);
        this._backTrans.setRotate([0, Math.PI * 2 * direction, 0], rotateTrans, callback);

        // Scale size to back size
        this._frontSize.set(this._backItemSize, sizeTrans, callback);
        this._backSize.set(this._backItemSize, sizeTrans, callback);
    }

    YouTubeModal.prototype.animateOut = function animateOut(rotateTrans, sizeTrans, direction) {
        direction = (direction === undefined) ? 1 : direction;

        this._backSurface.setContent('');

        this._removeIframe();

        this._halt();

        this._frontTrans.setRotate([0, 0, 0], rotateTrans);
        this._backTrans.setRotate([0, Math.PI * direction, 0], rotateTrans);

        // Scale size to front size
        this._frontSize.set(this._frontItemSize, sizeTrans);
        this._backSize.set(this._frontItemSize, sizeTrans);
    }

    YouTubeModal.prototype.setFrontItemSize = function setFrontItemSize(size) {
        this._frontItemSize = size;
        this._frontSize.set(this._frontItemSize);
    }

    YouTubeModal.prototype.setBackItemSize = function setBackItemSize(size) {
        this._backItemSize = size;
        this._backSize.set(this._backItemSize);

        // Update 'Loading' surface
        this._backSurface.setProperties({lineHeight: this._backItemSize[1] + 'px'});

        // Update YouTubeIFrame surface
        this._scaleSelectedIFrame();
    }


///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    YouTubeModal.prototype._init = function _init() {
        this._createScaffold(); // Create modifier, surfaces used to create two sided view
    }

    YouTubeModal.prototype._createScaffold = function _createScaffold() {
        //--------------------------------------------------------- Add front face
        this._frontSize = new Transitionable(this._frontItemSize);
        this._frontOpacity = new Transitionable(1);
        this._frontMod = new Modifier({
            size: this._frontSize,
            opacity: this._frontOpacity,
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

        //--------------------------------------------------------- Add back face
        this._backSize = new Transitionable(this._frontItemSize);
        this._backMod = new Modifier({
            size: this._backSize,
            origin: [0, 0],
            align: [0, 0]
        });

        this._backTrans = new TransTransform();
        this._backRotationMod = new Modifier({
            transform: this._backTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });
        this._backTrans.setRotate([0, Math.PI, 0]);
        this._backTrans.setTranslate([0, 0, 5]);


        // Add node for back of Modal
        this._backNode = new RenderNode();
        this.add(this._backMod).add(this._backRotationMod).add(this._backNode);

        // Add surface to back node
        this._backSurface = new Surface();
        this._backNode.add(this._backSurface);
    }

    YouTubeModal.prototype._addYoutubeIframe = function _addYoutubeIframe() {
        var self = this;
        var index = this._data.index;
        var transition;

        // reset zIndex/zTranslate
        this._frontSurface.setProperties({properties: {zIndex: 0}});
        this._frontTrans.setTranslate([0, 0, 0]);

        if (!this._iframeNodes[index]) {
            // Set up iFrame
            var iframe = document.createElement('iframe');
            var size = this._backItemSize;
            iframe.width = this._maxSize[0];
            iframe.height = this._maxSize[1];
            iframe.setAttribute('allowFullScreen', '');
            iframe.setAttribute('frameborder', '0');
            iframe.src = "//www.youtube.com/embed/" + this._data.content.id + "?enablejsapi=1&showinfo=0&autoplay=1";

            // Create surface/modifier with the iFrame
            var surface = new Surface({
                content: iframe,
                size: [this._maxSize[0], this._maxSize[1]]
            });

            var trans = new TransTransform();
            var opacity = new Transitionable(0);
            var mod = new Modifier({
                transform: trans,
                opacity: opacity,
                origin: [0.5, 0.5],
                align: [0.5, 0.5]
            });

            // Place iFrame node in front of 'Loading' surface to
            // avoid flickering
            surface.setProperties({zIndex: 2});
            trans.setTranslate([0, 0, 5]);


            // Fade in iFrame to avoid flash
            iframe.onload = function () {
                opacity.set(1, {duration: 350});
            }

            // Add to back node
            this._backNode.add(mod).add(surface);

            // Save reference
            this._iframeNodes[index] = {};
            this._iframeNodes[index].iframe = iframe;
            this._iframeNodes[index].opacity = opacity;
            this._iframeNodes[index].trans = trans;
            this._iframeNodes[index].mod = mod;
            this._iframeNodes[index].surface = surface;
        }
        // Animate in the surface
        else {
            this._iframeNodes[index].opacity.set(1, {duration: 500});
            transition = {duration: 500, curve: 'outExpo'};
        }

        // Scale iFrame surface so that that its size matches
        // the size specified for the back item
        this._scaleSelectedIFrame(transition);
    }

    YouTubeModal.prototype._removeIframe = function _removeIframe() {
        var item = this._iframeNodes[this._data.index];
        if (item === undefined) return;

        // Pause video
        item.iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');

        // Hide video
        item.opacity.set(0, {duration: 500});
        item.trans.setScale([0.01, 0.01, 1], {duration: 500});
    }

    YouTubeModal.prototype._scaleSelectedIFrame = function _scaleSelectedIFrame(transition) {
        if (this._iframeNodes[this._data.index]) {
            var scaleX = this._backItemSize[0] / this._maxSize[0];
            var scaleY = this._backItemSize[1] / this._maxSize[1];
            this._iframeNodes[this._data.index].trans.setScale([scaleX, scaleY, 1], transition);
        }
    }

    YouTubeModal.prototype._halt = function _halt(first_argument) {
        this._frontTrans.halt();
        this._backTrans.halt();
        this._backSize.halt();
        this._frontSize.halt();
    };

    module.exports = YouTubeModal;
});
