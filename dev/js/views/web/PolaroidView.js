define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Lightbox = require('famous/views/Lightbox');
    var Easing = require('famous/transitions/Easing');

    var Polaroid = require('js/views/ui/Polaroid');

    function PolaroidView(options) {
        this.collection = options.collection;
        View.apply(this, arguments);

        _createPolaroids.call(this);
    }

    PolaroidView.prototype = Object.create(View.prototype);
    PolaroidView.prototype.constructor = PolaroidView;

    PolaroidView.DEFAULT_OPTIONS = {
        size: [450, 500],
        collection: undefined
    };

    function _createPolaroids() {

    }

    PolaroidView.prototype.showCurrentSlide = function() {
//        var duration = 2000;
//
//        _(this.polaroids).each(function(photoSurface, i){
//            setTimeout(function(){
//                this.lightbox.show(photoSurface);
//                photoSurface.fadeIn();
//            }.bind(this), duration*i);
//        }.bind(this));
//
//
//        this.ready = false;
//
        var polaroid = this.polaroids[0];
        this.lightbox.show(polaroid, function() {
            this.ready = true;
            polaroid.fadeIn();
        }.bind(this));
    };


    PolaroidView.prototype.load = function(size) {
        this.polaroids = this.collection.map(function(photo,i){
            var polaroid= new Polaroid({
                size: size,
                photoUrl: photo.get('url')
            });
            return polaroid;
        });

        this.play();
    }

    PolaroidView.prototype.play = function() {
        var duration = 5000;

        _(this.polaroids).each(function(photoSurface, i){
            setTimeout(function(){

                photoSurface.play(duration);
            }.bind(this), duration*i);
        }.bind(this));

        setTimeout(function(){
            this.play();
        }.bind(this), duration*this.polaroids.length)
    };

    module.exports = PolaroidView;
});

