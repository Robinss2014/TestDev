define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');

    module.exports = {
        'basicOpacity': { 
            fadeOut: function (component) {
                component.setOpacity(0, { 
                    curve: 'outSine',
                    duration: 500
                });
            },
            fadeIn: function (component) {
                component.setDelay(500);
                component.setOpacity(1, { 
                    curve: 'outSine',
                    duration: 500
                });
            }
        },
        'rotateX': {
            fadeOut: function (component) {
                var size = component.getSize();
                var curve = {
                    curve: 'outBack',
                    duration: 500
                };
                component.setTransform(
                    Transform.thenMove(
                        Transform.rotateX(Math.PI),
                        [0 , 0, size[1] * 0.5]
                        
                    ),
                    curve
                );
                component.setOpacity(0, curve);
            },
            fadeIn: function (component) {
                var size = component.getSize();
                var curve = {
                    curve: 'outBack',
                    duration: 500
                };
                component.setTransform(
                    Transform.thenMove(
                        Transform.rotateX(-Math.PI),
                        [0 , 0, size[1] * 0.5]
                    )
                );
                component.setTransform(
                    Transform.identity,
                    curve
                );
                component.setOpacity(1, curve);
            }
        }
    }
});
