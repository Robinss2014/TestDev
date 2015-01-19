define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Lightbox = require('famous/views/Lightbox');
    var Snapshots = require('js/views/ui/Snapshots');

    function SnapshotShow(options) {
        this.collection = options.collection;
        this.size = options.size;
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);
    }

    SnapshotShow.prototype = Object.create(View.prototype);
    SnapshotShow.prototype.constructor = SnapshotShow;

    SnapshotShow.DEFAULT_OPTIONS = {};

    function _createViews() {
        this.snapshots = this.collection.map(function(photo,i){
            var snapshot= new Snapshots({
                size: this.size,
                photoUrl: photo.get('url')
            });
            return snapshot;
        });
        var mod = new StateModifier({
            align: [.5,.5],
            origin: [.5,.5]
        });
        this.lightbox = new Lightbox({
            inTransform: Transform.translate(0, 0, 10),
            inTransition: {duration: 1000, curve: 'easeOut'},
            showTransform: Transform.translate(0, 0, 0),
            outTransform: Transform.translate(0, 0, -10),
            outTransition: {duration: 1000, curve: 'easeOut'},
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

    SnapshotShow.prototype.play = function() {
        var duration = 5000;

        _(this.snapshots).each(function(photoSurface, i){
            setTimeout(function(){
                this.lightbox.show(photoSurface);
                photoSurface.play(duration);
            }.bind(this), duration*i);
        }.bind(this));

        setTimeout(function(){
            this.play();
        }.bind(this), duration*this.snapshots.length)
    };

    module.exports = SnapshotShow;
});