define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');

    module.exports = {
        'show': { 
            'translateLeft': function (finalPos) {
                this.setTransform(Transform.translate(finalPos[0],finalPos[1], finalPos[2]), { 
                    curve: 'outExpo',
                    duration: 500
                });
            },
        },
        'hide': {
            'offscreenLeft': function () {
                var size = this.getSize();
                var pos = this.getWorldPosition();

                if (size[0] !== undefined && size[1] !== undefined) {
                    this.setPosition(-size[0] - pos[0], pos[1], 0, { 
                        curve: 'outExpo',
                        duration: 500
                    });
                }
            },
        }
    }

});
