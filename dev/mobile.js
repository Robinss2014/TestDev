define(function(require, exports, module) {
    'use strict';

    require('famous/core/View');
    var Engine = require('famous/core/Engine');
    var appState  = require('js/models/AppState');

    /* For Demobo orginal app view */
    //var AppView = require('js/views/pages/AppView');
    //var appView = new AppView();

    /* For Lightbox test app view */
    var LightBox = require('js/lightbox/BasicLightboxApp');
    var appView = new LightBox();

    var mainContext = Engine.createContext();
    mainContext.add(appView);

    _initDemobo();
    function _initDemobo() {
        var demobo_guid = "mobile";
        demobo.init({
            isHost: true,
            isSyncHost: false,
//            method: "code",
//            code: "1234",
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
        setTimeout(function(){
            console.log('connecting 1')
            if (demobo.discovery.isMobile()) {
                console.log('connecting 2')
                var ipCode = demobo.discovery.getCodeFromIP(demobo.discovery.getIPAddress());
                $('.demoboCode').append('<div class="instruction">1. Visit www.demobo.com/photo<br>2. Enter Code: <b>' + ipCode +'</b></div>');
                demobo.discovery.connectWIFIByCode(ipCode);
            }
        }.bind(this), 5000);

        window.appState = appState;
    }

});
