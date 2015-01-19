define(function(require, exports, module) {
    var UIStretchBox = require('ui/containers/UIStretchBox'),
        UIElement = require('ui/core/UIElement'),
        UIApp = require('ui/containers/UIApplication'),
        Surface = require('famous/core/Surface'),
        UIButton = require('ui/controls/UIButton');
        Easing = require('famous/transitions/Easing');

    document.body.style.backgroundColor = "black";

    //////////////////////////////////////////////////////////////////////
    // DECLARE VARIABLES
    //////////////////////////////////////////////////////////////////////

    var COLORS = [
        'rgba(174,129,255,1)',
        'rgba(230,219,116,1)',
        'rgba(166,226,46,1)',
        'rgba(190,214,255,1)',
        'rgba(207,191,173,1)',
        'rgba(190,214,255,1)',
        'rgba(255,0,127,1)'],
        STRETCHBOXELEMENTS = 10,
        maxElSize = 200,
        elements = [];

    //////////////////////////////////////////////////////////////////////
    // CREATE SEQUENCE AND FILL WITH ELEMENTS THAT CHANGE SIZE
    //////////////////////////////////////////////////////////////////////

    var stretchBox = new UIStretchBox({
        direction: 'x',
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        inAnimation: {
          method: 'spring',
          period: 300,
          dampingRatio: 0.3
        },
        outAnimation: {
          method: 'spring',
          period: 300,
          dampingRatio: 0.4
        },
    });

    fillStretchBox(stretchBox);

    // var removeInterval = setInterval(randomRemove.bind(null, stretchBox), 2000);
    var addInterval = setInterval(randomAdd.bind(null, stretchBox), 2000);

    //////////////////////////////////////////////////////////////////////
    // CREATE APP AND ADD CHILDREN
    //////////////////////////////////////////////////////////////////////


    var app = new UIApp({
        children: [
            stretchBox
        ]
    });

    //////////////////////////////////////////////////////////////////////
    // HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////////////

    function randomRemove (stretchBox) {
        if(stretchBox._children.length){
            var randomInt = 2;
            var randomElement = stretchBox._children[randomInt];
            stretchBox.removeChild(randomElement);
        } else {
            clearInterval(removeInterval);
        }
    }

    function randomAdd (stretchBox) {
        var element = new UIElement(getRandomElOptions());
        element.on('click', stretchBox.removeChild.bind(stretchBox, element));
        stretchBox.addChildAt(element, Math.floor(Math.random() * stretchBox._children.length));
    }

    function fillStretchBox (stretchBox) {
        var element;

        for (var i = 0; i < STRETCHBOXELEMENTS; i++) {
            element = new UIElement(getRandomElOptions());
            element.on('click', stretchBox.removeChild.bind(stretchBox, element));
            stretchBox.addChild(element);
        }
    }

    function getRandomElOptions() {
        var randomColor = COLORS[Math.round(Math.random() * (COLORS.length - 1))];
        var randomSize = [Math.random() * maxElSize, Math.random() * maxElSize];

        return {
            size: randomSize,
            style: {
                border: '3px solid ' + randomColor,
                "box-sizing":"border-box",
                "-moz-box-sizing":"border-box",
                "-webkit-box-sizing":"border-box",
                zIndex: 100,
                cursor: "pointer"
            }
        }
    }
});