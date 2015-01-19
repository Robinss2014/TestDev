define(function(require, exports, module) {
    var Engine = require('famous/core/Engine');
    var UIApp = require('ui/containers/UIApplication');
    var UIElement = require('ui/core/UIElement');
    var UIComponent = require('ui/core/UIComponent');

    Engine.setOptions({ appMode: false });
    var app = new UIApp();

    var activities = ['Breakfast', 'Learn', 'Code', 'Exercise', 'Lunch', 'Learn', 'Code', 'Dinner', 'More Code'];
    var circleArray = [];

    var background = new UIElement({
        size: [undefined, innerHeight * 2],
        style: {
            backgroundColor: '#2B2B2B'
        }
    });

    function makeUnderline(size, position) {
      app.addChild(new UIElement({
          size: size,
          position: position,
          style: {
              backgroundColor: '#F6F6F6',
              borderRadius: '100px'
          }
      }));
    }

    for (var i = 1; i < 14; i++) 
        makeUnderline([undefined, 1], [0, i * 100, null]);

    function makeCenterTimeline(size, position, color) {
        app.addChild(new UIElement({
            size: size,
            position: position,
            style: {
                backgroundColor: color,
            }
        }));
    }

    function makeRightArrow(size, position, color) {
        app.addChild(new UIElement({
            size: size,
            position: position,
            style: {
                width: 0, 
                height: 0, 
                borderTop: size[0] + 'px solid transparent',
                borderBottom: size[0] + 'px solid transparent',
                borderLeft: size[0] + 'px solid ' + color + ''
            }
        }));
    }

    function makeLeftArrow(size, position, color) {
        app.addChild(new UIElement({
            size: size,
            position: position,
            style: {
                width: 0, 
                height: 0, 
                borderTop: size[0] + 'px solid transparent',
                borderBottom: size[0] + 'px solid transparent',
                borderRight: size[0] + 'px solid ' + color + ''
            }
        }));
    }


    function makeCircle(size, position, content, color) {
        circle = new UIElement({ 
            size: [0, 0],
            position: position,
            origin: [0.5, 0.5],
            style: {
                background: 'radial-gradient(#b8e7bf, #46c17b)', 
                backgroundColor: color,
                borderRadius: size[0] + 'px'
            }
        });

        circleArray.push(circle);

        
        circle.on('mouseover', function() {
            this.setSize(size[0] * 1.5, size[1] * 1.5, { duration: 200, curve: 'easeInOut' });
        });
        circle.on('mouseout', function() {
            this.setSize(size[0], size[1], { duration: 200, curve: 'easeInOut' });
        });

        app.addChild(circle);
    }

    function startAnimation() {
        for(var i = 0; i < circleArray.length; i++) {
            circleArray[i].setSize(150, 150, { duration: 400, curve: 'linear' })
        }
    }

    for (var i = 0; i < 14; i++) 
        makeCenterTimeline([15, 100], [innerWidth/2, i * 100], '#E9E581');

    for (var i = 0; i < activities.length; i++)
        if (i % 2 === 1) makeRightArrow([15, 15], [innerWidth/2 + 20, i * 150 + 85], '#E9E581'); 
        else makeLeftArrow([15, 15], [innerWidth/2 - 20, i * 150 + 85], '#E9E581'); 


    for (var i = 0; i < activities.length; i++) 
        if ( i % 2 === 0)
          makeCircle([150, 150], [innerWidth/2 - 200, i * 150 + 100], activities[i], '#DE1B1B');
        else 
          makeCircle([150, 150], [innerWidth/2 + 230, i * 150 + 100], activities[i], '#DE1B1B');
    
    startAnimation();
    app.addChild(background);

});
