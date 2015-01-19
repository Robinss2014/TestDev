define(function(require, exports, module) {
	var UIApplication         = require('ui/containers/UIApplication');
	var UIList                = require('ui/controls/UIList');
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

	var list = new UIList({
		collection: models,
		size: [425, innerHeight],
		itemHeight: 110,
		origin: [0.5, 0.5],
		align: [0.5, 0.5],
		direction: 'y',
		scrollbar: true,
		// listItemConstructor: CustomRenderer.bouncy
		// listItemConstructor: CustomRenderer.flip
		// listItemConstructor: CustomRenderer.flyInRight
		// listItemConstructor: CustomRenderer.zipper
		listItemConstructor: CustomRenderer.rotateIn
		// listItemConstructor: CustomRenderer.slideIn
		// listItemConstructor: CustomRenderer.stretchy
	});

	/////////////////////////////////////////////////////////
    // CREATE APPLICATION
    /////////////////////////////////////////////////////////

	var app = new UIApplication({
		children: [list]
	});
});
