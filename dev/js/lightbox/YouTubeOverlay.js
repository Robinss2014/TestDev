define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');

    var Overlay = require('./Overlay');

    /*
     *  Overlay that is applied to YouTubeOverlay on hover.
     *
     *  @class Modal
     */
    function YouTubeOverlay() {
        Overlay.apply(this, arguments);

        // Properties
        this._content = this.options.content;

        this._overlayMod;
        this._overlayNode;

        this._overlayTrans;
        this._overlayOpacity;
        this._overlayBackgroundMod;
        this._overlaySurface;

        this._borderTrans;
        this._borderOpacity;
        this._borderMod;
        this._borderSurface;

        this._textTrans;
        this._textOpacity;
        this._textMod;
        this._textSurface;

        this._size = this.options.size;
        this._originalSize = this._size.slice();

        this._init();
    }

    YouTubeOverlay.DEFAULT_OPTIONS = {
        content: 'Standard Content',
        size: [100, 100]
    };

    YouTubeOverlay.prototype = Object.create(Overlay.prototype);
    YouTubeOverlay.prototype.constructor = YouTubeOverlay;

    YouTubeOverlay.prototype.setSize = function setSize(size) {
        this._size = size;
        this._setSize();
    }

    YouTubeOverlay.prototype.setContent = function setContent(data) {
        this._content = data.title;
        var centeredContent = this._getCenteredOverlayContent();
        this._textSurface.setContent(centeredContent);
    }

    YouTubeOverlay.prototype.setPosition = function setPosition(pos) {
        this._posTrans.setTranslate(pos);
    }

    YouTubeOverlay.prototype.display = function display() {
        var boxScale = [0.8, 0.8]; // Scale of initial border/overlay
        var duration = 200;
        var curve = 'outExpo';
        var self = this;

        this._haltAll();

        // Overlay
        this._overlayTrans.setScale([boxScale[0], boxScale[1], 1]);
        this._overlayTrans.setScale([1, 1, 1], {duration: duration, curve: curve});
        this._overlayOpacity.set(0.7, {duration: duration});

        // Border
        this._borderTrans.setScale([boxScale[0], boxScale[1], 1]);
        this._borderTrans.setScale([1.05, 1.05, 1], {duration: duration, curve: curve}, function () {
            self._borderTrans.setScale([1, 1, 1], {duration: 300, curve: 'inOutSine'});
        });
        this._borderOpacity.set(1, {duration: duration});

        // Text
        this._textTrans.setScale([0.3, 0.3, 1]);
        this._textTrans.setScale([1, 1, 1], {duration: duration, curve: curve});
        this._textOpacity.set(1, {duration: duration});
    }

    YouTubeOverlay.prototype.hide = function hide() {
        var boxScale = [0.8, 0.8]; // Scale of final border/overlay
        var duration = 150;
        var curve = 'outExpo';

        this._haltAll();

        // Overlay
        this._overlayTrans.setScale([boxScale[0], boxScale[1], 1], {duration: duration, curve: curve});
        this._overlayOpacity.set(0, {duration: duration});

        // Border
        this._borderTrans.setScale([boxScale[0], boxScale[1], 1], {duration: duration, curve: curve});
        this._borderOpacity.set(0, {duration: duration * 0.7});

        // Text
        this._textTrans.setScale([0.3, 0.3, 1], {duration: duration, curve: curve});
        this._textOpacity.set(0, {duration: duration});
    }

    YouTubeOverlay.prototype.animateClick = function animateClick() {
        var boxScale = [8, 8]
        var duration = 350;
        var curve = 'inSine';
        var self = this;

        this._haltAll();

        // Border
        this._borderSurface.setProperties({zIndex: 10});
        self._borderOpacity.set(0, {duration: duration, curve: curve}, function () {
            self._borderSurface.setProperties({zIndex: 5});
        });
        this._borderTrans.setScale([boxScale[0], boxScale[1], 1], {duration: duration, curve: curve});

        // Hide Text/Overlay
        this._textOpacity.set(0);
        this._overlayOpacity.set(0);
    }

    YouTubeOverlay.prototype._init = function _init(first_argument) {
        // Add position mod to position border/text/overlay using origin/align of [0, 0]
        this._posTrans = new TransTransform();
        this._overlayMod = new Modifier({
            origin: [0, 0],
            align: [0, 0],
            size: this._size,
            transform: this._posTrans
        });
        this._overlayNode = this.add(this._overlayMod);

        this._addOverlayBackground();
        this._addBorder();
        this._addText();
    };

    YouTubeOverlay.prototype._addOverlayBackground = function _addOverlayBackground() {
        this._overlayTrans = new TransTransform();
        this._overlayOpacity = new Transitionable(0);
        this._overlayBackgroundMod = new Modifier({
            size: this._size,
            opacity: this._overlayOpacity,
            transform: this._overlayTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });
        this._overlaySurface = new Surface({
            size: this._size,
            properties: {
                backgroundColor: 'black',
                zIndex: 5
            }
        });
        this._overlayNode.add(this._overlayBackgroundMod).add(this._overlaySurface);
    }

    YouTubeOverlay.prototype._addBorder = function _addBorder() {
        this._borderTrans = new TransTransform();
        this._borderOpacity = new Transitionable(0);
        this._borderMod = new Modifier({
            size: this._size,
            opacity: this._borderOpacity,
            transform: this._borderTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });
        this._borderSurface = new Surface({
            size: this._size,
            properties: {
                border: '5px solid #3cf',
                boxSizing: 'border-box',
                zIndex: 10
            }
        });
        this._overlayNode.add(this._borderMod).add(this._borderSurface);
    }

    YouTubeOverlay.prototype._addText = function _addText() {
        this._textTrans = new TransTransform();
        this._textOpacity = new Transitionable(0);
        this._textMod = new Modifier({
            size: this._size,
            opacity: this._textOpacity,
            transform: this._textTrans,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });

        var centeredContent = this._getCenteredOverlayContent();
        this._textSurface = new Surface({
            content: centeredContent,
            size: this._size,
            properties: {
                color: 'white',
                fontSize: Math.floor(this._size[1] * 0.06) + 'px',
                fontWeight: 'bold',
                fontFamily: 'Arial',
                zIndex: 5
            }
        });
        this._overlayNode.add(this._textMod).add(this._textSurface);
    }

    YouTubeOverlay.prototype._getCenteredOverlayContent = function _getCenteredOverlayContent() {
        var size = [Math.floor(this._size[0]), Math.floor(this._size[1])];

        return '' +
            '<div style="text-align:center; width:' + size[0] + 'px; height:' + size[1] + 'px; line-height:' + size[1] + 'px">' +
            '<div style="display:inline-block; vertical-align:middle; line-height:normal; margin-left:25px; margin-right:25px">' +
            this._content +
            '</div>' +
            '</div>';
    }

    YouTubeOverlay.prototype._haltAll = function _haltAll() {
        this._overlayTrans.halt();
        this._overlayOpacity.halt();
        this._borderTrans.halt();
        this._borderOpacity.halt();
        this._textTrans.halt();
        this._textOpacity.halt();
    }

    YouTubeOverlay.prototype._setSize = function _setSize() {
        this._overlayMod.setSize(this._size);
        this._overlayBackgroundMod.setSize(this._size);
        this._overlaySurface.setSize(this._size);
        this._borderMod.setSize(this._size);
        this._borderSurface.setSize(this._size);
        this._textMod.setSize(this._size);
        this._textSurface.setSize(this._size);

        // Adjust font size
        this._textSurface.setProperties({fontSize: Math.floor(this._size[1] * 0.06) + 'px'});
    }

    module.exports = YouTubeOverlay;
});
