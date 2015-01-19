define(function(require, exports, module) {
    var Photo = require('js/models/Photo');

    var PhotoCollection = Backbone.Collection.extend({
        model: Photo,

        loadGallery: function(onLoad){
            if (typeof cordova != "undefined") {
                console.log(cordova.file.externalRootDirectory);

                // load gallery from phone
                // this.add({url: "", timestamp: "", id: ""});
                var addPhotos = function(urls) {
                    _.each(urls, function (url,i) {
                        //To test whether we get the imageURL ----- Done!
                        console.log('Hi');

                        //Adding model into collection
                        this.add({url: url, timestamp: Date.now(), id: i});
                        //this.add({});

                    }.bind(this));
                    onLoad();
                }.bind(this);
                getImageURL(addPhotos);
            }
            else {
                for (var i=0; i<50; i++) {
                    this.add({});
                }
                onLoad();
            }
        },

        loadSlideshow: function(){
            if (!window.configs.dev) {
//
//                //Todo: add slideshow models to collection
//
////                var addPhotos = function(urls) {
////                    _.each(urls, function (url,i) {
////                        //To test whether we get the imageURL ----- Done!
////                        console.log('Hi');
////
////                        //Adding model into collection
////                        this.add({url: url, timestamp: Date.now(), id: i});
////                        //this.add({});
////
////                    }.bind(this));
////                    onLoad();
////                }.bind(this);
////                getImageURL(addPhotos);
            } else {
                console.log('dev mode');

                this.add({url: 'http://assets.worldwildlife.org/photos/2090/images/hero_small/Sumatran-Tiger-Hero.jpg?1345559303'});
                this.add({url: 'http://luxesoul.com/wp-content/uploads/2014/08/elephants.jpg'});
                this.add({url: 'http://assets.inhabitat.com/wp-content/blogs.dir/1/files/2014/02/Jylland-Park-Zoo-Denmark-Danish-Zoo-Giraffe-Copenhagen-Zoo-Marius-the-Giraffe-fed-to-lions-second-Giraffe-to-stay-alive.jpg'});
                this.add({url: 'http://animalia-life.com/data_images/wallpaper/wolf-wallpaper/wolf-wallpaper-05.jpg'});
                this.add({url: 'http://animalia-life.com/data_images/otter/otter5.jpg'});
                this.add({url: 'http://animalia-life.com/data_images/wallpaper/cat-wallpaper/cat-wallpaper-09.jpg'});
                this.add({url: 'https://img1.etsystatic.com/000/0/6348803/il_fullxfull.331833603.jpg'});
                this.add({url: 'http://images8.alphacoders.com/406/406546.jpg'});
                this.add({url: 'http://redpandanetwork.org/blog/wp-content/gallery/redpanda/main-panda-fat.jpg'});
                this.add({url: 'http://data.whicdn.com/images/11589358/tumblr_lntywnHdIJ1qc52apo1_500_large.jpg'});
                this.add({url: 'http://a66c7b.medialib.glogster.com/media/5c/5c615c07693a5347b3cc49dc85994b856de362e6617caaf40f0267ad373c32b5/sea-turtle-1024x768-wallpaper.jpg'});
            }
        }

    });


    /* make operations on the file system */
    // Need to test on Nexus 5
    function getImageURL(callback) {
        var imageURL = new Array();
        console.log('Use getImageURL():');
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            var fileRoot = fileSystem.root;

            //For Sony
            //File path: /storage/sdcard0/DCIM/100ANDRO/DSC_0605.jpg
            //For Nexus5
            //File path: /storage/emulated/0/DCIM/Camera/IMG_20150107_01.jpg
            //For iphone6:
            //File path:
            fileRoot.getDirectory('dcim/camera', {create: false}, function (dcim) {
                var directoryReader = dcim.createReader();
                console.log('Output getImageURL:');
                directoryReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        imageURL[i]=entries[i].toURL();
                        console.log('URL:'+imageURL[i]);
                    }
                    console.log('1');
                    console.log(imageURL[0]);
                    console.log(imageURL[9]);
                    callback(imageURL);
                }, function (e) {
                    console.log(e.code);
                });

            }, function (error) {
                console.log(error.code);
            });
        }, function (evt) { // error get file system
            console.log(evt.target.error.code);
        });
    };

    module.exports = PhotoCollection;
});