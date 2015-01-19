var Transform = require('famous/core/Transform');
module.exports = { 
    'rotateIn': function (parent, child, index) {
        //var pos = this.getChildPosition(index);
        child.setTransform(Transform.rotateZ(Math.PI * 0.5));
        child.setOpacity(0);
        child.setDelay(index * 25);
        child.setTransform(Transform.identity, this.options.scaleTransition);
        child.setOpacity(1, this.options.opacityTransition);
    },
    'rotateOut': function (parent, child, index) {
        
    },
    'scaleX': function (parent, child, index) {
        child.setDelay(index * 25);        
        child.setScale(0, 0, 1, this.options.scaleTransition);
    },
    'instantScaleX': function (parent, child, index) {
        child.setScale(0,1,1);
    }
}
