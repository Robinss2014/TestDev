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
     *  Class that represents the slides in 'browsing mode'.
     *
     *  @class BasicItem
     */
    function BasicItem() {
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

    BasicItem.DEFAULT_OPTIONS = {
        id: null,
        size: [100, 100],
        data: {},
        createOverlay: true
    };

    BasicItem.prototype = Object.create(Item.prototype);
    BasicItem.prototype.constructor = BasicItem;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    BasicItem.prototype.getData = function getData() {
        return this.options.data;
    }

    BasicItem.prototype.getSize = function getSize() {
        return this._size.slice();
    }

    BasicItem.prototype.setOpacity = function setOpacity(value, transition, cb) {
        this._thumbOpacityTrans.set(value, transition, cb);
    }

    BasicItem.prototype.setScale = function setScale(value, transition) {
        this._parentTrans.setScale(value, transition);

        this._size[0] = value[0] * this._originalSize[0];
        this._size[1] = value[1] * this._originalSize[1];

        // Adjust font size on overlay if item is scaled up to prevent font bluring.
        if (this._size[0] > this._originalSize[0] || this._size[1] > this._originalSize[1]) {
            // TODO: Issue is that the larger font will also get scaled which will
            // mess up the ratio b/w overlay text size and item size
        }
    }

    BasicItem.prototype.getSurfaceContent = function getSurfaceContent() {
        return this._thumbSurf.getContent();
    }

    BasicItem.prototype.getSurfaceProperties = function getSurfaceProperties() {
        return this._thumbSurf.getProperties();
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    BasicItem.prototype._init = function _init() {
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

    BasicItem.PALLETES = [
        [
            "hsl(190, 60%, 80%)",
            "hsl(192, 60%, 80%)",
            "hsl(194, 60%, 80%)",
            "hsl(196, 60%, 80%)",
            "hsl(198, 60%, 80%)",
            "hsl(200, 60%, 80%)",
            "hsl(202, 60%, 80%)",
            "hsl(204, 60%, 80%)",
            "hsl(206, 60%, 80%)",
            "hsl(208, 60%, 80%)",
            "hsl(210, 60%, 80%)",
            "hsl(212, 60%, 80%)",
            "hsl(214, 60%, 80%)",
            "hsl(216, 60%, 80%)",
            "hsl(218, 60%, 80%)",
            "hsl(220, 60%, 80%)",
            "hsl(222, 60%, 80%)",
            "hsl(224, 60%, 80%)",
            "hsl(226, 60%, 80%)",
            "hsl(228, 60%, 80%)",
            "hsl(230, 60%, 80%)",
            "hsl(232, 60%, 80%)",
            "hsl(234, 60%, 80%)",
            "hsl(236, 60%, 80%)",
            "hsl(238, 60%, 80%)",
            "hsl(240, 60%, 80%)",
            "hsl(242, 60%, 80%)",
            "hsl(244, 60%, 80%)",
            "hsl(246, 60%, 80%)",
            "hsl(248, 60%, 80%)",
            "hsl(250, 60%, 80%)",
            "hsl(252, 60%, 80%)",
            "hsl(254, 60%, 80%)",
            "hsl(256, 60%, 80%)",
            "hsl(258, 60%, 80%)",
            "hsl(260, 60%, 80%)",
            "hsl(262, 60%, 80%)",
            "hsl(264, 60%, 80%)",
            "hsl(266, 60%, 80%)",
            "hsl(268, 60%, 80%)",
            "hsl(270, 60%, 80%)",
            "hsl(272, 60%, 80%)",
            "hsl(274, 60%, 80%)",
            "hsl(276, 60%, 80%)",
            "hsl(278, 60%, 80%)",
            "hsl(280, 60%, 80%)",
            "hsl(282, 60%, 80%)",
            "hsl(284, 60%, 80%)",
            "hsl(286, 60%, 80%)",
            "hsl(288, 60%, 80%)",
            "hsl(290, 60%, 80%)",
            "hsl(292, 60%, 80%)",
            "hsl(294, 60%, 80%)",
            "hsl(296, 60%, 80%)",
            "hsl(298, 60%, 80%)",
            "hsl(300, 60%, 80%)",
            "hsl(302, 60%, 80%)",
            "hsl(304, 60%, 80%)",
            "hsl(306, 60%, 80%)",
            "hsl(308, 60%, 80%)",
            "hsl(310, 60%, 80%)",
            "hsl(312, 60%, 80%)",
            "hsl(314, 60%, 80%)",
            "hsl(316, 60%, 80%)",
            "hsl(318, 60%, 80%)",
            "hsl(320, 60%, 80%)",
            "hsl(322, 60%, 80%)",
            "hsl(324, 60%, 80%)",
            "hsl(326, 60%, 80%)",
            "hsl(328, 60%, 80%)",
            "hsl(330, 60%, 80%)",
            "hsl(332, 60%, 80%)",
            "hsl(334, 60%, 80%)",
            "hsl(336, 60%, 80%)",
            "hsl(338, 60%, 80%)",
            "hsl(340, 60%, 80%)",
            "hsl(342, 60%, 80%)",
            "hsl(344, 60%, 80%)",
            "hsl(346, 60%, 80%)",
            "hsl(348, 60%, 80%)",
            "hsl(350, 60%, 80%)",
            "hsl(352, 60%, 80%)",
            "hsl(354, 60%, 80%)",
            "hsl(356, 60%, 80%)",
            "hsl(358, 60%, 80%)",
            "hsl(360, 60%, 80%)",
            "hsl(362, 60%, 80%)",
            "hsl(364, 60%, 80%)",
            "hsl(366, 60%, 80%)",
            "hsl(368, 60%, 80%)",
            "hsl(370, 60%, 80%)",
            "hsl(372, 60%, 80%)",
            "hsl(374, 60%, 80%)",
            "hsl(376, 60%, 80%)",
            "hsl(378, 60%, 80%)",
            "hsl(380, 60%, 80%)",
            "hsl(382, 60%, 80%)",
            "hsl(384, 60%, 80%)",
            "hsl(386, 60%, 80%)",
            "hsl(388, 60%, 80%)",
        ],
        [
            '#ccd9f2',
            '#d7ffff',
            '#7984af',
            '#799daa',
            '#ccd7ed',
            '#d9ffee',
            '#799dad',
            '#79a8a2'
        ],
        [
            '#444466',
            '#aa5533',
            '#556699',
            '#cc6644',
            '#dd8855',
            '#aa5563'
        ],
        [
            '#467191',
            '#5183A8',
            '#65A3D1',
            '#65A3D1',
            '#5589B0'
        ],
        [
            '#22a7c9',
            '#cbd5d2',
            '#1a2945',
            '#97c4ca',
            '#bed1d1',
            '#c8d2d0'
        ],
        [
            '#ACAFE0',
            '#199BDE',
            '#1E8DEB',
            '#27ADD1',
            '#7272BD'
        ],
        [
            'rgb(71, 123, 163)',
            '#bbd9ee',
            '#ebf4fa',
            '#ffffff',
            '#c0c0c0',
            '#e7e4d3',
            '#f1efe2'
        ]
    ]
    var count = 0;

    BasicItem.prototype._addThumbnail = function _addThumbnail() {
//    debugger;
        this._thumbSurf = new Surface({
            content: this.options.data['title'],
            size: this._size,
            properties: {
                cursor: 'pointer',
                boxShadow: '3px 10px 30px 0px rgba(0,0,0,0.75)',
                backgroundImage: 'url("http://placekitten.com/g/200/200")'
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

    BasicItem.prototype._addEventOverlay = function _addEventOverlay() {
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

    module.exports = BasicItem;

});
