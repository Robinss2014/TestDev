define(function(require, exports, module) {
    'use strict';

    var Engine = require('famous/core/Engine');
    var SlideshowView = require('js/views/web/SlideshowView');
    var appState  = require('js/models/AppState');

    var mainContext = Engine.createContext();

    var slideshowView = new SlideshowView();
    mainContext.add(slideshowView);

    _initDemobo();
    function _initDemobo() {
        var demobo_guid = 'web';
        demobo.init({
            isHost: false,
            isSyncHost: true,
            alwaysOn: true,
//            method: "code",
//            code: 1234,
            maxConnections: 1,
            appName: "demoboPhoto",
            layers: ["websocket:8030"],
            onSuccess: function() {
                console.log('onSuccess')
            }.bind(this),
            onFailure: function() {
                console.log('onFailure')
            }.bind(this),
            onPairing: function() {
                console.log('onPairing')
            }.bind(this),
            onTimeout: function() {
                console.log('onTimeout')
            }.bind(this)
        });
        appState.on("change",function(model, value){
            console.log(model, value);
        });
        window.appState = appState;
    }
});
