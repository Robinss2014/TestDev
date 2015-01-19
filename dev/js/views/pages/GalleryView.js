define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Engine = require('famous/core/Engine');
    var ImageSurface = require('famous/surfaces/ImageSurface')
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing = require('famous/transitions/Easing');
    var PinchSync = require('famous/inputs/PinchSync');
    var FlexGrid = require('js/views/components/FlexGrid');
    var PhotoCollection = require('js/models/PhotoCollection');

    function GalleryView() {
        View.apply(this, arguments);

        this.numSurfaces = 24;
        this.width = window.innerWidth;
        this.margins = this.width/50;
        this.photoSizes = [this.width];

        for (var i = 1; i < 8; i++) {
            var photoSize = (this.width-(i+2)*this.margins)/(i+1);
            this.photoSizes.push(photoSize);
        } window.photoSizes = this.photoSizes;

        _createCollections.call(this);
        _setListeners.call(this);
    }

    GalleryView.prototype = Object.create(View.prototype);
    GalleryView.prototype.constructor = GalleryView;

    GalleryView.DEFAULT_OPTIONS = {};

    function _createCollections() {
        this.photoCollection = new PhotoCollection();
        //this.add(loadingIcon);
        //loadingIcon.show();

        var onLoad = function(){
            this.photoSurfaces = this.photoCollection.map(function(photo,i){
                var surface = new ImageSurface({
                    content: photo.get('url'),
                    properties: {
                        backgroundColor: 'hsl(' + (i * 360 / this.numSurfaces) + ', 100%, 50%)',
                        objectFit: 'cover'
                    }
                });
                surface.on('click', function(){
                    console.log('surface clicked!');
                    //do something when clicked
                });
                return surface;
            });
            //loadingIcon.hide();
            _createViews.call(this);
            window.photoCollection = this.photoCollection;
            window.photoSurfaces = this.photoSurfaces;

        }.bind(this);

        this.photoCollection.loadGallery(onLoad);

        this.photoCollection.on('sync', function(collection, photo) {
            console.log('sync')
        });
        this.photoCollection.on('add', function(collection, photo) {
            console.log('add',photo);
        }.bind(this));

    }

    function _createViews() {
        this.pinchSize = new Transitionable(photoSizes[2]); window.pinchSize = this.pinchSize;

        this.flexGrid = new FlexGrid({
            marginTop: this.width/20,
            marginSide: this.margins,
            gutterCol: this.margins,
            gutterRow: this.margins,
            itemSize: this.pinchSize
        });

        this.add(this.flexGrid);
        this.flexGrid.sequenceFrom(this.photoSurfaces);
        window.flexgrid = this.flexGrid;
        window.engine = Engine;
    }

    function _setListeners() {
        var sync = new PinchSync();

        Engine.pipe(sync);

        sync.on('start', function(data){

        }.bind(this));

        sync.on('update', function(data) {
            var originalSize = this.pinchSize.get();
//            if (originalSize < this.photoSizes[this.photoSizes.length/2]) {
                var newSize = Math.floor(originalSize + data.displacement/100);
//            } else {
//                newSize = Math.floor(originalSize + data.displacement/100);
//            }
            if (newSize <= this.photoSizes[1] && newSize >= this.photoSizes[this.photoSizes.length-1]-1) this.pinchSize.set(newSize);
        }.bind(this));

        sync.on('end', function(data){
            var cols = this.flexGrid.getCols(); console.log(cols, this.photoSizes[cols-1]);
            var newSize = this.photoSizes[cols-1];
            this.pinchSize.halt();
            this.pinchSize.set(newSize, {duration: 500, curve: 'easeIn'});

            console.log(this.pinchSize.get())

        }.bind(this));
    }

    module.exports = GalleryView;
});