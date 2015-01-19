define(function(require, exports, module) {
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');

    module.exports = {
        popIn : function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform(
                Transform.move(
                    Transform.scale( 0.000001, 0.000001),
                    [window.innerWidth * 0.5, window.innerHeight * 0.5]));

            modifier.setTransform( Transform.identity, curve, callback);
        },

        popOut: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                    curve       : Easing.inOutExpoNorm,
                    duration    : 1000
                };

            modifier.halt();
            modifier.setTransform(
                Transform.move(Transform.scale( 0.000001, 0.000001),
                    [window.innerWidth * 0.5, window.innerHeight * 0.5]),
                curve,
                callback
            );
        },

        fadeLeft: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( -window.innerWidth, 0, 0), curve, callback);
            modifier.setOpacity( 0, curve);
        },

        fadeInLeft: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( window.innerWidth, 0, 0));
            modifier.setTransform( Transform.identity, curve, callback);

            modifier.setOpacity( 0 );
            modifier.setOpacity( 1, curve);
        },

        fadeRight: function ( callback, curve) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( window.innerWidth, 0, 0), curve, callback);
            modifier.setOpacity( 0, curve);
        },
        fadeSmallRight: function ( callback, curve) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( 200, 0, 0), curve, callback);
            modifier.setOpacity( 0, curve);
        },
        fadeInRight : function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( -window.innerWidth, 0, 0));
            modifier.setTransform( Transform.identity, curve, callback);

            modifier.setOpacity( 0 );
            modifier.setOpacity( 1, curve);

        },
        fadeInSmallRight : function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( -200, 0, 0));
            modifier.setTransform( Transform.identity, curve, callback);

            modifier.setOpacity( 0 );
            modifier.setOpacity( 1, curve);

        },
        fadeInForward: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inOutExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setTransform( Transform.translate( 0, 0, -200));
            modifier.setTransform( Transform.identity, curve, callback);

            modifier.setOpacity( 0 );
            modifier.setOpacity( 1, curve);

        },
        fallBack: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                method : 'spring',
                period : 1000,
                dampingRatio: 0.5
            };
            modifier.halt();
            modifier.setOrigin([0,1]);
            modifier.setTransform( Transform.rotateX( Math.PI * .35), curve, callback);

        },

        fadeOut: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.inExpoNorm,
                duration    : 1000
            };

            modifier.halt();
            modifier.setOpacity( 1 );
            modifier.setOpacity( 0, curve, callback);
            modifier.setTransform( Transform.identity );

        },
        fadeIn: function ( callback, curve ) {
            var modifier = this.getActiveModifier();
            curve = curve ? curve : {
                curve       : Easing.outExpoNorm,
                duration    : 750
            };

            modifier.halt();
            modifier.setOpacity( 0 );
            modifier.setOpacity( 1, curve, callback);
        },
    };
});
