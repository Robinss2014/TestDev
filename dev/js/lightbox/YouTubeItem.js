define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var RenderNode = require('famous/core/RenderNode');
    var Scrollview = require('famous/views/Scrollview');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var SizeAwareView = require('famous-scene/SizeAwareView');
    var Item = require('./Item');

    /*
     *  Class that represents the slides in 'browsing mode' for the YouTubeLightbox.
     *
     *  @class YouTubeItem
     */
    function YouTubeItem() {
        Item.apply(this, arguments);

        // Properties
        this._parentTrans;
        this._parentTransMod;
        this._parentNode;

        this._thumbSurf;
        this._thumbOpacityTrans;
        this._thumbMod;

        this._eventCatcher;

        this._size = this.options.size;
        this._originalSize = this._size.slice();

        this._init();
    }

    YouTubeItem.DEFAULT_OPTIONS = {
        id: null,
        size: [100, 100],
        data: {},
        createOverlay: true
    };

    YouTubeItem.prototype = Object.create(Item.prototype);
    YouTubeItem.prototype.constructor = YouTubeItem;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    YouTubeItem.prototype.getData = function getData() {
        return this.options.data;
    }

    YouTubeItem.prototype.getSize = function getSize() {
        return this._size.slice();
    }

    YouTubeItem.prototype.setOpacity = function setOpacity(value, transition) {
        this._thumbOpacityTrans.set(value, transition);
    }

    YouTubeItem.prototype.setScale = function setScale(value, transition) {
        this._parentTrans.setScale(value, transition);

        this._size[0] = value[0] * this._originalSize[0];
        this._size[1] = value[1] * this._originalSize[1];

        // Adjust font size on overlay if item is scaled up to prevent font bluring.
        if (this._size[0] > this._originalSize[0] || this._size[1] > this._originalSize[1]) {
            // TODO: Issue is that the larger font will also get scaled which will
            // mess up the ratio b/w overlay text size and item size
        }
    }

    Item.prototype.getSurfaceContent = function getSurfaceContent() {
        return this._thumbSurf.getContent();
    }

    Item.prototype.getSurfaceProperties = function getSurfaceProperties() {
        return this._thumbSurf.getProperties();
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    YouTubeItem.prototype._init = function _init() {
        this._parentTrans = new TransTransform();
        this._parentTransMod = new Modifier({
            size: this._size,
            transform: this._parentTrans,
        });
        this._parentNode = new RenderNode();
        this.add(this._parentTransMod).add(this._parentNode);

        this._addThumbnail();

        if (this.options.createOverlay) {
            this._addEventOverlay();
        }
    }

    YouTubeItem.prototype._addThumbnail = function _addThumbnail() {
        this._thumbSurf = new Surface({
            size: this._size,
            properties: {
                cursor: 'pointer',
                boxShadow: '3px 10px 30px 0px rgba(0,0,0,0.75)',
                backgroundImage: 'url("' + this.options.data.highResThumbURL + '")',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }
        });

        this._thumbOpacityTrans = new Transitionable(1);
        this._thumbMod = new Modifier({
            opacity: this._thumbOpacityTrans
        })

        this._parentNode.add(this._thumbMod).add(this._thumbSurf);

        if (!this.options.createOverlay) {
            this._thumbSurf.on('click', this._eventOutput.emit.bind(this._eventOutput, 'click', this.options.id));
        }
    }

    YouTubeItem.prototype._addEventOverlay = function _addEventOverlay() {
        // Add event catcher overlay to trigger hover/click events
        var eventCatcherMod = new Modifier({
            transform: Transform.translate(0, 0, 5)
        });
        this._eventCatcher = new Surface({
            classes: ['lightbox-item-eventcatcher'],
            properties: {zIndex: 15, cursor: 'pointer'},
            size: this._size
        });
        this._parentNode.add(eventCatcherMod).add(this._eventCatcher);

        var self = this;
        this._eventCatcher.on('mouseover', this._eventOutput.emit.bind(this._eventOutput, 'mouseover', this.options.id));
        this._eventCatcher.on('mouseout', this._eventOutput.emit.bind(this._eventOutput, 'mouseout', this.options.id));
        this._eventCatcher.on('click', this._eventOutput.emit.bind(this._eventOutput, 'click', this.options.id));
    }

    module.exports = YouTubeItem;
});
