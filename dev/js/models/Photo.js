define(function(require, exports, module) {

    var Photo  = Backbone.Model.extend({
        defaults: {
            url: 'http://img.wallpaperstock.net:81/cute-cat-wallpapers_34549_640x960.jpg'
            //url: 'file:///storage/emulated/0/dcim/camera/IMG_20150107_141545.jpg'
        },
        initialize: function(options){

        }
    });

    module.exports = Photo;
});