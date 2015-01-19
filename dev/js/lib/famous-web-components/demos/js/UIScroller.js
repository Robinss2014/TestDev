define(function(require, exports, module) {
	var Engine = require('famous/core/Engine');
	var UIApplication = require('ui/containers/UIApplication');
	var UIScrollContainer = require('ui/containers/UIScrollContainer');
	var UIElement = require('ui/core/UIElement');
	var UIStretchBox = require('ui/containers/UIStretchBox');

	/////////////////////////////////////////////////////////
	// SET APP MODE TO FALSE
	/////////////////////////////////////////////////////////

    Engine.setOptions({
        appMode: false
    });

	var app = new UIApplication();

	/////////////////////////////////////////////////////////
	// CREATE FILLER CONTENT
	/////////////////////////////////////////////////////////

	var COLORS = ['yellow', 'lightblue'];

	var stretchBox = new UIStretchBox({
		children: createChildren(),
		direction: 'y',
		inAnimation: {}
	});

	/////////////////////////////////////////////////////////
	// CREATE SCROLLER AND ADD CONTENT
	/////////////////////////////////////////////////////////

	var scroller = new UIScrollContainer({
		size: [300, innerHeight * 0.75],
		scrollbar: true,
		backfaceVisibility: true
	});

	scroller.setRotation(0, 1.0, 0);

	/////////////////////////////////////////////////////////
	// ADD THAT SHIT
	/////////////////////////////////////////////////////////

	app.addChild(scroller);
	scroller.addChild(stretchBox);

	/////////////////////////////////////////////////////////
	// API TESTS
	/////////////////////////////////////////////////////////

	scroller.setVScrollPosition(1198, {duration: 1000});
	scroller.setHScrollPosition(200, {duration: 3000});

	console.log("CURRENT VSCROLL -> ", scroller.getVScrollPosition());
	console.log("CURRENT HSCROLL -> ", scroller.getHScrollPosition());
	console.log("MAX VSCROLL -> ", scroller.getMaxVScrollPosition());
	console.log("MAX HSCROLL -> ", scroller.getMaxHScrollPosition());

	/////////////////////////////////////////////////////////
	// HELPER FUNCTIONS
	/////////////////////////////////////////////////////////

	function createChildren () {
		var children = [];
		var color;
		var listItem;

		for (var i = 0; i < 50; i++) {
				listItem = new UIElement({
				size: [300, 100],
				style: {
					border: '10px solid black',
					backgroundColor: COLORS[i % 2]
				}
			})
			children.push(listItem);
		}

		return children;
	}
});

