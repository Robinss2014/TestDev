define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Lightbox = require('famous/views/Lightbox');
    var ClassicPhoto = require('js/views/ui/ClassicPhoto');

//    var Lightbox = require('js/views/components/FancyLightbox');

    function ClassicShow(options) {
        this.collection = options.collection;
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);
    }

    ClassicShow.prototype = Object.create(View.prototype);
    ClassicShow.prototype.constructor = ClassicShow;

    ClassicShow.DEFAULT_OPTIONS = {};

    function _createViews() {
        this.photoSurfaces = this.collection.map(function(photo,i){
            var classicPhoto = new ClassicPhoto({
                size: this.size,
                photoUrl: photo.get('url')
            });
            return classicPhoto;
        });
        var mod = new StateModifier({
            align: [.5,.5],
            origin: [.5,.5]
        });
        this.lightbox = new Lightbox({
            inTransform: Transform.translate(0,0,-20),
            inTransition: {duration: 2000, curve: 'easeOut'},
            showTransform: Transform.translate(0,0,0),
            outTransform: Transform.translate(0,0,-10),
            outTransition: {duration: 2000, curve: 'easeOut'},
            inOpacity: 0,
            showOpacity: 1,
            outOpacity: 0,
            overlap: true
        });
        this.add(mod).add(this.lightbox);
        this.play();
    }

    function _setListeners() {

    }

    ClassicShow.prototype.play = function() {
        var duration = 5000;

        _(this.photoSurfaces).each(function(photoSurface, i){
            setTimeout(function(){
                this.lightbox.show(photoSurface);
                photoSurface.play(duration);
            }.bind(this), duration*i);
        }.bind(this));

        setTimeout(function(){
            this.play();
        }.bind(this), duration*this.photoSurfaces.length)
    };

    module.exports = ClassicShow;
});