define(function(require, exports, module) {

    var RenderNode = require('famous/core/RenderNode');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var Timer = require('famous/utilities/Timer');

    var AdditionalDetail = require('./AdditionalDetail');

    /*
     *  Additional detail view for basic item.
     *
     *  @class BasicAdditionalDetail
     */
    function BasicAdditionalDetail() {
        AdditionalDetail.apply(this, arguments);

        // Properties
        this._mod;
        this._layout;

        this._nodes = [];
        this._items = [];

        this._delay = this.options.delay;

        this._init();
    }

    BasicAdditionalDetail.DEFAULT_OPTIONS = {
        delay: 500,
        size: [50, 50]
    };

    BasicAdditionalDetail.prototype = Object.create(AdditionalDetail.prototype);
    BasicAdditionalDetail.prototype.constructor = BasicAdditionalDetail;

// Methods to be implemented in child classes
    BasicAdditionalDetail.prototype.animateIn = function animateIn(translateTrans, opacityTrans) {
        var item;
        var delay = 0;
        var delayStep = this._delay / 4;

        for (var i = 0; i < this._items.length; i++) {
            item = this._items[i];
            item.trans.halt();
            item.opacity.halt();

            item.trans.setTranslate([400, 0]);
            item.opacity.set(0);
            item.trans.translate.delay(delay, function (item) {
                item.trans.setTranslate([0, 0], translateTrans);
                item.opacity.set(1, opacityTrans);
            }.bind(this, item));

            delay += delayStep;
        }
        ;
    }

    BasicAdditionalDetail.prototype.animateOut = function animateOut(translateTrans, opacityTrans) {
        var item;
        for (var i = 0; i < this._items.length; i++) {
            item = this._items[i];
            item.trans.halt();
            item.opacity.halt();

            item.trans.setTranslate([0, 0]);
            item.trans.setTranslate([400, 0], translateTrans);
            item.opacity.set(0, opacityTrans);
        }
        ;
    }

    BasicAdditionalDetail.prototype.updateContent = function updateContent(data) {
        this._items[0].surf.setContent(data.title);
        this._items[1].surf.setContent('Subtitle ' + data.title.split(' ')[1]);
        this._items[2].surf.setContent(data.description);
        this._items[3].surf.setContent('Author: Famo.us');
    }

    BasicAdditionalDetail.prototype.setSize = function setSize(size) {
        this._mod.setSize(size);

        // Hide description if detail is positioned below
        if (size[0] > size[1]) {
            this._items[2].surf.setSize([0, 0]);
        }
        else {
            var descriptionHeight = this._items[2].surf.getSize()[1]
            if (descriptionHeight === 0) {
                this._items[2].surf.setSize([size[0], true]);
            }
            else {
                var availableSpace = size[1]
                    - this._items[0].surf.getSize()[1]
                    - this._items[1].surf.getSize()[1]
                    - this._items[3].surf.getSize()[1];

                this._items[2].surf.setSize([size[0], Math.min(availableSpace, descriptionHeight)]);
            }
        }

        this._items[0].surf.setSize([size[0], true]);
        this._items[1].surf.setSize([size[0], true]);
        var authorSize = size[1] < 400 ? [0, 0] : [size[0], true];
        this._items[3].surf.setSize(authorSize);
    }

    BasicAdditionalDetail.prototype.setDelay = function setDelay(value) {
        this._delay = value;
    }


    BasicAdditionalDetail.prototype._init = function _init() {
        this._mod = new Modifier({
            size: this.options.size
        });

        this._layout = new SequentialLayout({
            itemSpacing: 5
        });

        this._addLayoutItem('title', ['additional-detail-block', 'additional-detail-title'], [true, true]);
        this._addLayoutItem('subtitle', ['additional-detail-block', 'additional-detail-subtitle'], [true, true]);
        this._addLayoutItem('description', ['additional-detail-block', 'additional-detail-description'], [true, true]);
        this._addLayoutItem('author', ['additional-detail-block', 'additional-detail-author'], [true, true]);

        this._layout.sequenceFrom(this._nodes);
        this.add(this._mod).add(this._layout);
    }

    BasicAdditionalDetail.prototype._addLayoutItem = function _addLayoutItem(name, classes, size) {
        var obj = {};
        obj.name = name;
        obj.surf = new Surface({
            size: size,
            classes: classes
        });
        obj.surf.on('click', this._eventOutput.emit.bind(this._eventOutput, 'click'));

        obj.opacity = new Transitionable(0);
        obj.trans = new TransTransform();
        obj.mod = new Modifier({
            transform: obj.trans,
            opacity: obj.opacity
        });

        obj.node = new RenderNode();
        obj.node.add(obj.mod).add(obj.surf);

        this._nodes.push(obj.node);
        this._items.push(obj);
    }

    module.exports = BasicAdditionalDetail;

});
