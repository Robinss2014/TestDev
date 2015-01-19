define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Lightbox = require('famous/views/Lightbox');
    var PhotoCollection = require('js/models/PhotoCollection');
    var CameraView = require('js/views/web/CameraView');
    var ClassicShow = require('js/views/web/ClassicShow');
    var SnapshotShow = require('js/views/web/SnapshotShow');
    var PolaroidShow = require('js/views/web/PolaroidShow');
    var appState  = require('js/models/AppState');

    var currentSlideShow = 'polaroid';

    function SlideshowView() {
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);

        window.changeSlideShow = changeSlideShow;
        window.slideshowView = this;
    }

    SlideshowView.prototype = Object.create(View.prototype);
    SlideshowView.prototype.constructor = SlideshowView;

    SlideshowView.DEFAULT_OPTIONS = {
        size: [window.innerWidth*0.85, window.innerHeight],
        polaroidSize: [350,400]
    };

    function _createViews() {
        this.photoCollection = new PhotoCollection();
        this.photoCollection.loadSlideshow();

        this.slideshowLightbox = new Lightbox({
            inTransform: Transform.translate(-window.innerWidth*2, 0, 0),
            inTransition: {duration: 1000, curve: 'easeOut'},
            showTransform: Transform.translate(0, 0, 0),
            outTransform: Transform.translate(-window.innerWidth*2, 0, 0),
            outTransition: {duration: 1000, curve: 'easeOut'},
            inOpacity: 0,
            showOpacity: 1,
            outOpacity: 0,
            overlap: true
        });
        window.slideshowLightbox = this.slideshowLightbox;

        this.classicShow = new ClassicShow({
            collection: this.photoCollection
        });

        this.snapshotShow = new SnapshotShow({
            collection: this.photoCollection
        });

        this.polaroidShow = new PolaroidShow({
            collection: this.photoCollection
        });

        this.showContainer = new ContainerSurface({
            properties: {
                overflow: 'hidden'
            }
        });

        this.showMod = new StateModifier({
            origin: [0.5,0.5],
            align: [0.5,0.5],
            size: [window.innerWidth, window.innerHeight]
        });

        this.add(this.showMod).add(this.showContainer);
        this.showContainer.add(this.slideshowLightbox);
        this.showContainer.context.setPerspective(1000);

        onLoad.call(this);

        window.photoCollection = this.photoCollection;
//    window.classicShow = classicShow;

    }

    var onLoad = function() {
        if (currentSlideShow == 'snapshot') {
            this.slideshowLightbox.show(this.snapshotShow);
        } else if (currentSlideShow == 'classic') {
            this.slideshowLightbox.show(this.classicShow);
        } else if (currentSlideShow == 'polaroid') {
            this.slideshowLightbox.show(this.polaroidShow);
        }
    }

    function _setListeners() {
        appState.on('change:slideshow', function(model, value) {
            changeSlideShow.call(this, value);
        }.bind(this));
    }

    function changeSlideShow(slideshowId) {
        switch(slideshowId) {
            case 'classic':
                this.slideshowLightbox.show(this.classicShow);
                break;
            case 'snapshot':
                this.slideshowLightbox.show(this.snapshotShow);
                break;
            case 'instantCamera':
                this.slideshowLightbox.show(this.polaroidShow);
                break;
            default:
                this.slideshowLightbox.show(this.classicShow);
        }
    }

    module.exports = SlideshowView;
});