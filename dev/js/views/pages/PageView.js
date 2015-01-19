define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var HeaderFooter = require('famous/views/HeaderFooterLayout');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var EventHandler = require('famous/core/EventHandler');
    var GalleryView = require('js/views/pages/GalleryView');

    function PageView() {
        View.apply(this, arguments);

        _createLayout.call(this);
        _createHeader.call(this);
        _createBody.call(this);
        _setListeners.call(this);
    }

    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    PageView.DEFAULT_OPTIONS = {
        headerSize: 44
    };

    function _createLayout() {
        this.layout = new HeaderFooter({
            headerSize: this.options.headerSize
        });

        var layoutModifier = new StateModifier({
            transform: Transform.translate(0, 0, 0.1)
        });

        this.add(layoutModifier).add(this.layout);
        console.log('Layout is done');
    }

    function _createHeader() {
        var backgroundSurface = new Surface({
            content: 'Demobo Photo',
            properties: {
                color: 'white',
                lineHeight: "44px",
                textAlign: 'center',
                backgroundColor: 'black'
            }
        });

        this.hamburgerSurface = new ImageSurface({
            size: [44, 44],
            content: 'assets/imgs/hamburger.png'
        });

        this.cameraSurface = new ImageSurface({
            size: [44, 44],
            content: 'assets/imgs/camera1.png'
        });

        var backgroundModifier = new StateModifier({
            transform: Transform.behind
        });

        var hamburgerModifier = new StateModifier({
            origin: [0, 0.5],
            align: [0, 0.5]
        });

        var cameraModifier = new StateModifier({
            origin: [1, 0.5],
            align: [1, 0.5]
        });

        this.layout.header.add(backgroundModifier).add(backgroundSurface);
        this.layout.header.add(hamburgerModifier).add(this.hamburgerSurface);
        this.layout.header.add(cameraModifier).add(this.cameraSurface);

        console.log('header is done');
    }

    function _createBody() {

        var bodySurface = new Surface({
            size: [undefined, undefined],
            properties: {
                background: 'grey'
            }
        });

        var bodyModifier = new StateModifier({
            transform: Transform.translate(0, 0, 1)
        });

        this.layout.content.add(bodyModifier).add(bodySurface);


        this.galleryView = new GalleryView();

        //this.layout.content.add(this.galleryView);

        console.log('body is done');
    }

    function _setListeners() {
        this.hamburgerSurface.on('click', function() {
            this._eventOutput.emit('menuToggle');
        }.bind(this));

        //this.cameraSurface.on('click', _takePicture);
        this.cameraSurface.on('click', capturePhoto);
    }

    function _takePicture() {
        console.log('takePicture');
        var options = {
            quality: 20,
            allowEdit: true,
            targetWidth: 360,
            targetHeight: 640,
//                destinationType: Camera.DestinationType.DATA_URL,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA
        };

        navigator.camera.getPicture(
            function (imageURI) {
                console.log("getPicture");
                //
                //$img.attr('src', imageURI);
                var fileName = "" + (new Date()).getTime() + ".jpg"; // consider a more reliable way to generate unique ids
                console.log("getPicture", imageURI, fileName);
                s3Uploader.upload(imageURI, fileName)
                    .done(function () {
                        console.log("S3 upload succeeded");
                        alert("S3 upload succeeded");
                    })
                    .fail(function () {
                        console.log("S3 upload failed");
                        alert("S3 upload failed");
                    });
            },
            function (message) {
                // We typically get here because the use canceled the photo operation. Fail silently.
            }, options);

        return false;

    };


    function capturePhoto() {
        console.log('capturePhoto:');
        var options = {
            quality: 20,
            allowEdit: true,
            targetWidth: 360,
            targetHeight: 640,
//                destinationType: Camera.DestinationType.DATA_URL,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.CAMERA
        };

        // Retrieve image file location from specified source
        navigator.camera.getPicture(onPhotoSuccess, function(message) {
            alert('Image Capture Failed');
        }, options);

    };

    function onPhotoSuccess(imageURI) {

        var gotFileEntry = function (fileEntry) {
            console.log("Default Image Directory " + fileEntry.fullPath);
            var gotFileSystem = function (fileSystem) {

                fileSystem.root.getDirectory("MyAppFolder", {
                    create: true
                }, function (dataDir) {
                    var d = new Date();
                    var n = d.getTime();
                    //new file name
                    var newFileName = n + ".jpg";
                    // copy the file
                    fileEntry.moveTo(dataDir, newFileName, null, fsFail);

                }, dirFail);

            };
            // get file system to copy or move image file to
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem,
                onFail);
        };
        // resolve file system for image
        window.resolveLocalFileSystemURI(imageURI, gotFileEntry, fsFail);

        // file system fail
        var onFail = function (error) {
            alert("failed " + error.code);

        };

        var dirFail = function (error) {
            alert("Directory" + error.code);

        };
    }

    module.exports = PageView;
});
