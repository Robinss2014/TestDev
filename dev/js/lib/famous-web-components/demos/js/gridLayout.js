define(function(require, exports, module) {
    var UIGridLayout = require('ui/containers/UIGridLayout');
    var UIRow = require('ui/containers/UIRow');
    var UIApp = require('ui/containers/UIApplication');
    var UIElement = require('ui/core/UIElement');
    var Engine = require('famous/core/Engine');
    var UIComponent = require('ui/core/UIComponent');
    var UITooltip = require('ui/controls/UITooltip');

    document.body.style.backgroundColor = "#3f3e60";

    var header;
    var footer;
    var bodyElements = [];
    var nestedElements = [];

    var elementData = [
        {
            color: '#445b7b',
            height: 150,
            content: 'lg-12'
        },{
            color: '#685b79',
            height: 275,
            content: 'lg-4 md-3'
        },{
            color: '#ac6b81',
            height: 275,
            content: 'lg-3 md-3'
        },{
            color: '#dc707d',
            height: 175,
            content: 'lg-2 md-6'
        },{
            color: '#ffbd5f',
            height: 275,
            content: 'lg-3 md-6'
        },{
            color: '#445b7b',
            height: 225,
            content: 'lg-2 md-6'
        },{
            color: '#685b79',
            height: 350,
            content: 'lg-5 md-6'
        },{
            color: '#ac6b81',
            height: 350,
            content: 'lg-5 md-6'
        },{
            color: '#dc707d',
            height: 150,
            content: 'lg-2 md-6'
        },{
            color: '#ffbd5f',
            height: 150,
            content: 'lg-7 md-6'
        },{
            color: '#445b7b',
            height: 150,
            content: 'lg-3 md-6'
        },{
            color: '#685b79',
            height: 150,
            content: 'lg-12'
        }
    ];


    //////////////////////////////////////////////////////////////////////
    // CREATE APP
    //////////////////////////////////////////////////////////////////////

    Engine.setOptions({
        appMode: false
    });
    var app = new UIApp();

    //////////////////////////////////////////////////////////////////////
    // CREATE BACKGROUND
    //////////////////////////////////////////////////////////////////////

    var background = new UIElement({
        size: [undefined, innerHeight * 5],
        style: {
            backgroundColor: "#3f3e60"
        }
    });

    app.addChild(background);

    //////////////////////////////////////////////////////////////////////
    // CREATE ELEMENTS
    //////////////////////////////////////////////////////////////////////

    generateElements();

    //////////////////////////////////////////////////////////////////////
    // DECLARE LAYOUT
    //////////////////////////////////////////////////////////////////////

    //note that the height makes no difference in the layout...
    var layout = new UIGridLayout({
        width: 1,
        gutters: 30,
        columns: 12,
        position: [0, 30],
        percentage: [0.65, 1],
        origin: [0.5, 0],
        align: [0.5, 0],
        rows: [
            [
                { 
                    element: bodyElements[0],
                    offset: { sm: 0 },
                    cols: { lg: 12 }
                }
            ],
            [
                {
                    element: bodyElements[1],
                    offset: { sm: 0 },
                    cols: { lg: 4, md: 3 }
                },
                {
                    element: bodyElements[2],
                    offset: { sm: 0 },
                    cols: { lg: 3, md: 3 }
                },
                {
                    element: bodyElements[3],
                    offset: { sm: 0 },
                    cols: { lg: 2, md: 6 }
                },
                {
                    element: bodyElements[4],
                    offset: { sm: 0 },
                    cols: { lg: 3, md: 6 }
                },
                {
                    element: bodyElements[5],
                    offset: { sm: 0 },
                    cols: { lg: 2, md: 6 }
                },
                // {
                //     element: [
                //         {
                //             element: nestedElements[0],
                //             offset: { sm: 0 },
                //             cols: { lg: 6 }
                //         },
                //         {
                //             element: nestedElements[1],
                //             offset: { sm: 0 },
                //             cols: { lg: 6 }
                //         }
                //     ],
                //     offset: { sm: 0 },
                //     cols: { lg: 3, md: 6 }
                // },
                {
                    element: bodyElements[6],
                    offset: { sm: 0 },
                    cols: { lg: 5, md: 6 }
                },
                {
                    element: bodyElements[7],
                    offset: { sm: 0 },
                    cols: { lg: 5, md: 6 }
                },
                {
                    element: bodyElements[8],
                    offset: { sm: 0 },
                    cols: { lg: 2, md: 6 }
                },
                {
                    element: bodyElements[9],
                    offset: { sm: 0 },
                    cols: { lg: 7, md: 6 }
                },
                {
                    element: bodyElements[10],
                    offset: { sm: 0 },
                    cols: { lg: 3, md: 6 }
                },
            ],
            [
                {
                    element: bodyElements[11],
                    offset: { sm: 0 },
                    cols: { lg: 12 }
                }
            ]
        ]
    });

    //////////////////////////////////////////////////////////////////////
    // ADD LAYOUT TO APP
    //////////////////////////////////////////////////////////////////////

    app.addChild(layout);

    //////////////////////////////////////////////////////////////////////
    // GENERATE ELEMENTS
    //////////////////////////////////////////////////////////////////////


    function generateElements () {
        var element;
        var data;
        var toolTip;
        for (var i = 0; i < 12; i++) {
            data = elementData[i];

            /* BUILD COMPONENT */
            element = new UIComponent({
                size: [undefined, data.height]
            });

            /* ADD ELEMENT */
            element._addChild(new UIElement({
                content: '<p class="grid-item">' + i.toString() + "</p>",
                classes: ['grid-shadow'],
                style: {
                    backgroundColor: data.color
                }
            }))
            /* ADD TOOLTIP */
            toolTip = new UITooltip({
                text: data.content,
                background: 'white',
                color: data.color,
                margin: '15px',
                borderRadius: '5px'
            });
            element._addChild(toolTip);
            element.on('mouseover', function(toolTip){
                toolTip.show();
            }.bind(this, toolTip));
            element.on('mouseout', function(toolTip){
                toolTip.hide();
            }.bind(this, toolTip));

            /* ADD TO ARRAY */
            bodyElements.push(element);
        }
    }
});
