define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transitionable   = require('famous/transitions/Transitionable');

    function Polaroid() {
        View.apply(this, arguments);

        this.rootModifier = new StateModifier({
            size: this.options.size
        });

        this.mainNode = this.add(this.rootModifier);

        _createPolaroid.call(this);

    }

    Polaroid.prototype = Object.create(View.prototype);
    Polaroid.prototype.constructor = Polaroid;

    Polaroid.DEFAULT_OPTIONS = {
        size: [400, 450],
        filmBorder: 15,
        photoBorder: 3,
        photoUrl: undefined,
        angle: -0.5,
        zIndex: 0
    };

    function _createPolaroid() {
        _createBackground.call(this);
        _createFilm.call(this);
        _createPhoto.call(this);
    }

    function _createBackground() {
        var background = new Surface({
            properties: {
                backgroundColor: '#FFFFF5',
                boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                zIndex: this.options.zIndex
            }
        });

        this.mainNode.add(background);

        background.on('click', function() {
            this._eventOutput.emit('click');
        }.bind(this));
    }

    function _createFilm() {
        this.options.filmSize = this.options.size[0] - 2 * this.options.filmBorder;

        var film = new Surface({
            size: [this.options.filmSize, this.options.filmSize],
            properties: {
                backgroundColor: '#222',
                zIndex: this.options.zIndex+1,
                pointerEvents: 'none'
            }
        });

        var filmModifier = new StateModifier({
            origin: [0.5, 0],
            align: [0.5, 0],
            transform: Transform.translate(0, this.options.filmBorder, 0.05)
        });

        this.mainNode.add(filmModifier).add(film);
    }

    function _createPhoto() {
        var size = this.options.filmSize - 2 * this.options.photoBorder;

        var photo = new ImageSurface({
            size: [size, size],
            content: this.options.photoUrl,
            properties: {
                zIndex: this.options.zIndex+2,
                pointerEvents: 'none'
            }
        });

        this.photoModifier = new StateModifier({
            origin: [0.5, 0],
            align: [0.5, 0],
            transform: Transform.translate(0, this.options.filmBorder + this.options.photoBorder, 0.1),
            opacity: 0.01
        });

        this.mainNode.add(this.photoModifier).add(photo);
    }

    Polaroid.prototype.fadeIn = function() {
        this.photoModifier.setOpacity(1, { duration: 1500, curve: 'easeIn' });
//        this.shake();
    };

    Polaroid.prototype.shake = function() {
//        this.rootModifier.halt();
//        this.rootModifier.setTransform(Transform.rotateX(this.options.angle), { duration: 200, curve: 'easeOut' });
//        this.rootModifier.setTransform(Transform.identity, { curve: 'spring', period: 600, dampingRatio: 0.15 });

    };

    module.exports = Polaroid;
});

