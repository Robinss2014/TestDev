define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Lightbox = require('famous/views/Lightbox');
    var Easing = require('famous/transitions/Easing');

    var Polaroid = require('js/views/ui/Polaroid');

    function CameraPolaroidView(options) {
        this.collection = options.collection;
        View.apply(this, arguments);

        this.rootModifier = new StateModifier({
            size: this.options.size,
            origin: [0, 0],
            align: [0, -0.25]
        });

        this.mainNode = this.add(this.rootModifier);

        _createLightbox.call(this);
        _createPolaroids.call(this);
    }

    CameraPolaroidView.prototype = Object.create(View.prototype);
    CameraPolaroidView.prototype.constructor = CameraPolaroidView;

    CameraPolaroidView.DEFAULT_OPTIONS = {
        size: [450, 500],
        collection: undefined,
        lightboxOpts: {
            inOpacity: 1,
            outOpacity: 0,
            inOrigin: [0, 0],
            outOrigin: [1, 0],
            showOrigin: [0, 0],
            inTransform: Transform.thenMove(Transform.rotateX(0.9), [0, -100, 0]),
            outTransform: Transform.thenMove(Transform.rotateZ(0.7), [0, window.innerHeight, -1000]),
            inTransition: { duration: 1500, curve: 'easeOut' },
            outTransition: { duration: 1000, curve: Easing.inCubic }
        }
    };

    function _createLightbox() {
        this.lightbox = new Lightbox(this.options.lightboxOpts);
        this.mainNode.add(this.lightbox);
    }

    function _createPolaroids() {
        this.polaroids = this.collection.map(function(photo,i){
            var polaroid= new Polaroid({
                size: this.options.size,
                photoUrl: photo.get('url'),
            });
            return polaroid;
        }.bind(this));

        this.showCurrentSlide();
    }

    CameraPolaroidView.prototype.showCurrentSlide = function() {
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

    CameraPolaroidView.prototype.showNextSlide = function() {
        if (!this.ready) return;

        this.currentIndex++;
        if (this.currentIndex === this.polaroids.length) this.currentIndex = 0;
        this.showCurrentSlide();
    };

    module.exports = CameraPolaroidView;
});

