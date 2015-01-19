define(function(require, exports, module) {  
    var UIBase = require('ui/core/UIBase');
    var UIElement = require('ui/core/UIElement');
    var UIApplication = require('ui/containers/UIApplication');

    var app = new UIApplication({
        children: [
            new UIElement({
                id: 'firstElement',
                size: [160, 35],
                style: { 
                    'backgroundColor': '#fa5c4f',
                    'color': 'white',
                    'fontFamily': 'Avenir, sans-serif',
                    'textAlign' : 'center',
                    'lineHeight': '35px',
                    'backfaceVisibility': 'visible'
                },
                content: 'I Exist!'
            }).center()
        ]
    });

    var elem = app.getByID('firstElement');
    elem.setDelay(2000);
    elem.setRotation(0, Math.PI * 2, 0, { 
        curve: 'outExpo',
        duration: 2000
    });
});
