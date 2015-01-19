define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');

    var AdditionalDetail = require('./AdditionalDetail');

    /*
     *  View that provides additional detail (i.e., video title and description) to supplement
     *  the YouTubeModal.
     *
     *  @class YouTubeAdditionalDetail
     */
    function YouTubeAdditionalDetail() {
        AdditionalDetail.apply(this, arguments);

        // Properties
        this._mod;
        this._opacity;
        this._trans;
        this._animationMod;
        this._surf;

        this._init();
    }

    YouTubeAdditionalDetail.DEFAULT_OPTIONS = {
        size: [50, 50]
    };

    YouTubeAdditionalDetail.prototype = Object.create(AdditionalDetail.prototype);
    YouTubeAdditionalDetail.prototype.constructor = YouTubeAdditionalDetail;

    YouTubeAdditionalDetail.prototype.animateIn = function animateIn(translateTrans, opacityTrans) {
        this._trans.setTranslate([400, 0]);
        this._trans.setTranslate([0, 0], translateTrans);

        this._opacity.set(1, opacityTrans);
    }

    YouTubeAdditionalDetail.prototype.animateOut = function animateOut(translateTrans, opacityTrans) {
        this._trans.setTranslate([0, 0]);
        this._trans.setTranslate([400, 0], translateTrans);

        this._opacity.set(0, opacityTrans);
    }

    YouTubeAdditionalDetail.prototype.setSize = function setSize(size) {
        this._mod.setSize(size);
    }

    YouTubeAdditionalDetail.prototype.updateContent = function _updateContent(data) {
        var content = '' +
            '<div class="additional-detail-block">' +
            '<div class="additional-detail-title">' + data.additionalDetail.title + '</div>' +
            '<div class="additional-detail-description">' + data.additionalDetail.description + '</div>' +
            '</div>'

        this._surf.setContent(content);
        this._surf.setProperties({whiteSpace: 'pre-wrap'}); // Maintain line breaks
    }

    YouTubeAdditionalDetail.prototype._init = function _init() {
        this._mod = new Modifier({
            size: this.options.size
        });

        this._opacity = new Transitionable(0);
        this._trans = new TransTransform();
        this._animationMod = new Modifier({
            opacity: this._opacity,
            transform: this._trans
        })

        this._surf = new Surface({
            content: '<div class="additional-detail-block"></div>',
            properties: {
                color: 'white',
                overflow: 'scroll'
            }
        });
        this._surf.on('click', this._eventOutput.emit.bind(this._eventOutput, 'click'));

        this.add(this._mod)
            .add(this._animationMod)
            .add(this._surf);
    }

    module.exports = YouTubeAdditionalDetail;
});
