define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function ClassicPhoto() {
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);
    }

    ClassicPhoto.prototype = Object.create(View.prototype);
    ClassicPhoto.prototype.constructor = ClassicPhoto;

    ClassicPhoto.DEFAULT_OPTIONS = {
        photoUrl: 'undefined'
    };

    function _createViews() {
        this.classicPhoto = new ImageSurface({
            content: this.options.photoUrl,
            properties: {
                objectFit: 'cover'
            }
        });
        this.classicMod = new StateModifier({
            size: this.options.size,
            align: [0.5,0.5],
            origin: [0.5,0.5],
            proportions: [1.2,1.2]
        });
        this.add(this.classicMod).add(this.classicPhoto);
    }

    function _setListeners() {

    }

    ClassicPhoto.prototype.play = function(duration) {
        var zoomOut = (Math.ceil(Math.random()*2)%2 == 0);
        if (zoomOut) this.proportions = [1,1];
        else this.proportions = [1.4,1.4];
        this.classicMod.setProportions(this.proportions, {duration: duration+2000, curve: 'easeOut'}, function() {
            this.classicMod.setProportions([1.2,1.2], {duration: 100, curve: 'easeOut'});
        }.bind(this));
    };
    module.exports = ClassicPhoto;
});