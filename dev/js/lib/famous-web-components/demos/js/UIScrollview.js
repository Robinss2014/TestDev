define(function(require, exports, module) {
	var Engine = require('famous/core/Engine');
	var UIApplication = require('ui/containers/UIApplication');
	var UIList = require('ui/containers/UIList');
	var UIElement = require('ui/core/UIElement');

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

	/////////////////////////////////////////////////////////
	// CREATE SCROLLER AND ADD CONTENT
	/////////////////////////////////////////////////////////

	var scrollerX = new UIList({
		origin: [0.5, 0.5],
		align: [0.5, 0.5],
		size: [innerWidth, 300],
		scrollbar: false,
		backfaceVisibility: true,
		children: createChildren(false, 100),
		direction: 'x',
		update: function(child, offset) {
			child.setRotation(offset / 150, 0, 0);
		}
	});

	var scrollerY = new UIList({
		origin: [0.5, 0.5],
		align: [0.5, 0.5],
		size: [500, innerHeight],
		scrollbar: false,
		backfaceVisibility: true,
		children: createChildren(true, 100),
		direction: 'y',
		update: function(child, offset) {
			child.setRotation(0, offset / 150, 0);
		}
	});

	var scrollerY2 = new UIList({
		origin: [0.5, 0.5],
		align: [0.9, 0.5],
		size: [500, innerHeight],
		position: [0, 0, -300],
		scrollbar: false,
		backfaceVisibility: true,
		children: createChildren(true, 200),
		direction: 'y',
		update: function(child, offset) {
			child.setRotation(0, offset / 150, 0);
		}
	});

	// scroller.setRotation(0, 1.0, 0);

	scrollerX.setHScrollPosition(1000, { duration: 3000 });
	scrollerY.setVScrollPosition(1000, { duration: 3000 });
	scrollerY2.setVScrollPosition(1000, { duration: 3000 });

	/////////////////////////////////////////////////////////
	// ADD THAT SHIT
	/////////////////////////////////////////////////////////

	app.addChild(scrollerX);
	app.addChild(scrollerY);
	app.addChild(scrollerY2);

	/////////////////////////////////////////////////////////
	// API TESTS
	/////////////////////////////////////////////////////////

	// scroller.setVScrollPosition(1198, {duration: 1000});
	// scroller.setHScrollPosition(200, {duration: 3000});

	/////////////////////////////////////////////////////////
	// HELPER FUNCTIONS
	/////////////////////////////////////////////////////////

	function createChildren (vertical, howMany) {
		var children = [];
		var color;
		var size = vertical ? [200, 40] : [40, 200];

		for (var i = 0; i < howMany; i++) {
			children.push(new UIElement({
				origin: [0.5, 0.5],
				size: size,
				style: {
					border: '1px solid black',
					backgroundColor: COLORS[i % 2],
					backfaceVisibility: 'visible'
				}
			}));
		}

		return children;
	}
});

