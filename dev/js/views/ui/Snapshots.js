define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function Snapshots(options) {
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);
    }

    Snapshots.prototype = Object.create(View.prototype);
    Snapshots.prototype.constructor = Snapshots;

    Snapshots.DEFAULT_OPTIONS = {
        size: [300,300],
        photoUrl: 'undefined'
    };

    function _createViews() {
        this.snapshotPhoto = new ImageSurface({
            classes: ['snapshotPhoto'],
            content: this.options.photoUrl,
            properties: {
                objectFit: 'cover'
            }
        });
        this.photoMod = new StateModifier({
            size: this.options.size,
            align: [.5,.5],
            origin: [.5,.5],
            proportions: [1,1]
        });
        this.add(this.photoMod).add(this.snapshotPhoto);

        this.snapshotBackground = new ImageSurface({
            classes: ['snapshotBackground'],
            content: this.options.photoUrl,
            properties: {
                objectFit: 'cover'
            }
        });
        this.backgroundMod = new StateModifier({
            size: this.options.size,
            align: [.5,.5],
            origin: [.5,.5],
            proportions: [2,2]
        });
        this.add(this.backgroundMod).add(this.snapshotBackground);
    }

    function _setListeners() {

    }

    Snapshots.prototype.play = function(duration) {
        var direction = (Math.ceil(Math.random()*2)%2 == 0) ? -1 : 1;
        var rotate = direction*Math.max(Math.PI/50, Math.random()*Math.PI/30);
        this.photoMod.setOpacity(1);
        this.photoMod.setProportions([0.75,0.75], {duration: duration, curve: 'easeOut'}, function() {
            this.photoMod.setOpacity(0);
            this.photoMod.setProportions([1, 1], {duration: 100, curve: 'easeOut'});
            this.photoMod.setTransform(Transform.rotateZ(0), {duration: 100, curve: 'easeOut'});
        }.bind(this));
        this.photoMod.setTransform(Transform.rotateZ(rotate), {duration: duration-1000, curve: 'easeOut'});
    };
    module.exports = Snapshots;
});