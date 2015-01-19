define(function(require, exports, module) {

    var RenderNode = require('famous/core/RenderNode');
    var YouTubeData = require('./YouTubeData');
    var YouTubeItem = require('./YouTubeItem');
    var YouTubeModal = require('./YouTubeModal');
    var YouTubeBasicModal = require('./YouTubeBasicModal');
    var YouTubeAdditionalDetail = require('./YouTubeAdditionalDetail');
    var LightBox = require('./Lightbox');
    var DeviceHelpers = require('./DeviceHelpers');

    /*
     *  Lightbox widget that is integrated with YouTube.
     *  This widget will overwrite certain Lightbox options in order to optimize the inital layout experience.
     *  The content of the widget is set by attaching a query onto the URL "?playlistId=_______" that points to a
     *  YouTube playlist.
     *
     *  @class YouTubeLightbox
     */

//-------------------------------------------------------------------------------//
// Load YouTube IFrame API
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
//-------------------------------------------------------------------------------//

    function YouTubeLightbox(options, parentSize, cb) {
        RenderNode.apply(this, arguments);
        options = options || {};

        YouTubeData(function (data) {
            // Construct 'additionalDetail' portion of detail
            for (var i = 0; i < data.length; i++) {
                data[i].additionalDetail = {};
                data[i].additionalDetail.title = data[i].title;
                data[i].additionalDetail.description = data[i].description;
            }

            //-------------------------------------------------------------------------------//
            // Set Lightbox constructor options for optomized initial layout
            var width = 640;
            var height = 480;
            var scale = 1;
            var heightToWidthRatio = height / width;

            // Fit at least 2 thumbnails within 90% of available width
            if ((parentSize[0] * 0.9 / 2) < 640) {
                width = parentSize[0] * 0.85 / 2;
                height = width * heightToWidthRatio;
            }

            options.itemData = data;
            options.itemConstructor = YouTubeItem;
            options.modalConstructor = YouTubeModal;
            options.additionalDetailConstructor = YouTubeAdditionalDetail;
            options.itemSize = [width * scale, height * scale];
            options.detailedItemSize = [width * scale * 1.5, height * scale * 1.5];
            options.additionalDetailPadding = [25, 25];
            options.modalMaxSize = [width * 2, height * 2];
            options.createOverlay = true;

            //-------------------------------------------------------------------------------//
            // Performance adjustments for different browser/device quirks:

            // Limit items that are dispalyed to 30 unless lightbox the demo is running on Chrome
            if (!(navigator.userAgent.toLowerCase().indexOf('chrome') > -1)) {
                options.itemData.splice(20);
            }

            // On Safari, use basic modal to avoid currently unresolved z-clipping issue
            // due to DOM nesting as a result of using a native scroll inside of a ContainerSurface.
            if ((navigator.userAgent.toLowerCase().indexOf('safari') > 1) && !(navigator.userAgent.toLowerCase().indexOf('chrome') > 1)) {
                options.modalConstructor = YouTubeBasicModal;
            }

            // On mobile, limit to 8 items, don't create overlay & use basic modal
            // without the flip animation due to clipping bugs.
            if (DeviceHelpers.isMobile()) {
                options.itemData.splice(8);
                options.createOverlay = false;
                options.modalConstructor = YouTubeBasicModal;
            }
            //-------------------------------------------------------------------------------//

            document.body.style.backgroundColor = 'rgb(20, 20, 20)';

            // Helper function to keep code DRY
            var self = this;
            var addLightbox = function () {
                self.lightbox = new LightBox(options);
                self.add(self.lightbox);
                if (cb) cb();
            }

            // Make sure that YouTube Player API is loaded before initializing
            if (window.YT) {
                addLightbox();
            } else {
                function onYouTubeIframeAPIReady() {
                    addLightbox();
                }
            }
        }.bind(this));
    }

    YouTubeLightbox.prototype = Object.create(RenderNode.prototype);
    YouTubeLightbox.prototype.constructor = YouTubeLightbox;

    module.exports = YouTubeLightbox;
});
