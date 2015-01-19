define(function(require, exports, module) {
    var UIApplication         = require('ui/containers/UIApplication');
    var UITrueSizeList        = require('ui/controls/UITrueSizeList');
    var UIStreamingCollection = require('ui/data/UIStreamingCollection');
    var Engine                = require('famous/core/Engine');
    var CustomRenderer        = require('./CustomListRenderers');

    /////////////////////////////////////////////////////////
    // DISABLE APPMODE
    /////////////////////////////////////////////////////////

    Engine.setOptions({
        appMode: false
    });

    /////////////////////////////////////////////////////////
    // CREATE STREAMING
    /////////////////////////////////////////////////////////

    var models = new UIStreamingCollection(  );
    models.fetchByKeyword('JavaScript');

    /////////////////////////////////////////////////////////
    // PASS COLLECTION TO LIST
    /////////////////////////////////////////////////////////

    var list = new UITrueSizeList({
        collection: models,
        size: [425, 500],
        itemHeight: 20,
        loadingSize: 110,
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        direction: 'y',
    });

    /////////////////////////////////////////////////////////
    // CREATE APPLICATION
    /////////////////////////////////////////////////////////

    var app = new UIApplication({
        children: [list]
    });
});
