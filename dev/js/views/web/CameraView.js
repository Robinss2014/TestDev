define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var CameraPolaroidView = require('js/views/web/CameraPolaroidView');

    function CameraView(options) {
        this.collection = options.collection;
        View.apply(this, arguments);
        _createViews.call(this);
        _createCamera.call(this);
        _setListeners.call(this);
    }

    CameraView.prototype = Object.create(View.prototype);
    CameraView.prototype.constructor = CameraView;

    CameraView.DEFAULT_OPTIONS = {
        cameraWidth: 0.5 * window.innerHeight
    };

    CameraView.DEFAULT_OPTIONS.slideWidth = 0.8 * CameraView.DEFAULT_OPTIONS.cameraWidth;
    CameraView.DEFAULT_OPTIONS.slideHeight = CameraView.DEFAULT_OPTIONS.slideWidth + 40;
    CameraView.DEFAULT_OPTIONS.slidePosition = 0.77 * CameraView.DEFAULT_OPTIONS.cameraWidth;

    function _createCamera() {
        var camera = new ImageSurface({
            size: [this.options.cameraWidth, true],
            content: 'assets/imgs/camera.png',
            properties: {
                width: '100%',
            }
        });

        var cameraModifier = new StateModifier({
            origin: [0.5, 0],
            align: [0.15, 0.03]
        });

        this.add(cameraModifier).add(camera);
        _createCameraPolaroid.call(this);
    }

    function _createCameraPolaroid() {
        var camPolaroidView = new CameraPolaroidView({
            size: [this.options.slideWidth, this.options.slideHeight],
            collection: this.collection
        });

        var camPolaroidMod = new StateModifier({
            origin: [0.5, 0],
            align: [0.15, 0.03],
            transform: Transform.translate(0, this.options.slidePosition, 0)
        });

        var camPolaroidContainer = new ContainerSurface({
            size: [this.options.slideWidth*2, this.options.slideHeight*2],
            properties: {
                overflow: 'hidden'
            }
        });

        this.add(camPolaroidMod).add(camPolaroidContainer);
        camPolaroidContainer.add(camPolaroidView);
        camPolaroidContainer.context.setPerspective(1000);
    }

    function _createViews() {
        this.background = new Surface({
            properties: {
                backgroundColor: '#333333',
                zIndex: 0
            }
        });

        this.backgroundMod = new StateModifier({
            origin: [0,0],
            align: [0,0],
            size: [this.options.cameraWidth, window.innerHeight]
        });

        this.add(this.backgroundMod).add(this.background);
    }

    function _setListeners() {

    }

    module.exports = CameraView;
});