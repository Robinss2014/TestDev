define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Lightbox = require('famous/views/Lightbox');
    var Easing = require('famous/transitions/Easing');
    var CameraView = require('js/views/web/CameraView');

    var PhysicsPolaroid = require('js/views/ui/PhysicsPolaroid');

    function PolaroidShow(options) {
        this.collection = options.collection;
        View.apply(this, arguments);

//        _createCameraView.call(this);

        _createPolaroids.call(this);
        _createCameraView.call(this);
    }

    PolaroidShow.prototype = Object.create(View.prototype);
    PolaroidShow.prototype.constructor = PolaroidShow;

    PolaroidShow.DEFAULT_OPTIONS = {
        size: [450, 500],
        collection: undefined,
        cameraWidth: 0.5 * window.innerHeight
    };

    PolaroidShow.DEFAULT_OPTIONS.slideWidth = 0.8 * PolaroidShow.DEFAULT_OPTIONS.cameraWidth;
    PolaroidShow.DEFAULT_OPTIONS.slideHeight = PolaroidShow.DEFAULT_OPTIONS.slideWidth + 40;
    PolaroidShow.DEFAULT_OPTIONS.slidePosition = 0.77 * PolaroidShow.DEFAULT_OPTIONS.cameraWidth;

    function _createCameraView() {
        this.cameraView = new CameraView({
            collection: this.collection,
            cameraWidth: this.options.cameraWidth,
            slideWidth: this.options.slideWidth,
            slideHeight: this.options.slideHeight,
            slidePosition: this.options.slidePosition
        });

        this.cameraLightbox = new Lightbox({
            inTransform: Transform.translate(-window.innerHeight*0.5, 0, 0),
            inTransition: {duration: 1000, curve: 'easeOut'},
            showTransform: Transform.translate(-10, 0, 0),
            outTransform: Transform.translate(-window.innerHeight*0.5, 0, 0),
            outTransition: {duration: 1000, curve: 'easeOut'},
            inOpacity: 0,
            showOpacity: 1,
            outOpacity: 0,
            overlap: true
        });
        this.add(this.cameraLightbox);

        this.cameraLightbox.show(this.cameraView);
    }

    function _createPolaroids() {
        this.polaroids = this.collection.map(function(photo,i){
            var polaroid= new PhysicsPolaroid({
                size: [this.options.slideWidth, this.options.slideHeight],
                photoUrl: photo.get('url')
            }); this.add(polaroid);
            return polaroid;
        }.bind(this));
    }

    PolaroidShow.prototype.showCurrentSlide = function() {
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
////
//        var polaroid = this.polaroids[0];
//        this.lightbox.show(polaroid, function() {
//            this.ready = true;
//            polaroid.fadeIn();
//        }.bind(this));
    };

    PolaroidShow.prototype.applyForces = function(){

    };

    PolaroidShow.prototype.load = function(size) {
//        this.polaroids = this.collection.map(function(photo,i){
//            var polaroid= new PhysicsPolaroid(this, this.physicsEngine, {
//                size: size,
//                photoUrl: photo.get('url')
//            });
//            polaroid.init(size, photo.get('url'));
////            this.physicsEngine.attach(this.gravity, polaroid);
//            return polaroid;
//        }.bind(this));
//
//        this.play();
    }

    PolaroidShow.prototype.play = function() {
//        var duration = 5000;
//        _(this.polaroids).each(function(photoSurface, i){
//            setTimeout(function(){
//                photoSurface.fadeIn();
////                photoSurface.play(duration);
//            }.bind(this), duration*i);
//        }.bind(this));
//
//        setTimeout(function(){
//            this.play();
//        }.bind(this), duration*this.polaroids.length)
    };

    module.exports = PolaroidShow;
});

