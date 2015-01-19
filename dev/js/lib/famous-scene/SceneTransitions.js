define(function(require, exports, module) {
    var Transitions = require('./Transitions');

    function SceneTransitions ( controller ) {
        this.controller = controller;
    }

    SceneTransitions.prototype.setController = function ( controller ) {
        this.controller = controller;
        for ( var key in Transitions) {
            SceneTransitions.prototype[key] = Transitions[key].bind(this.controller);
        };
    };
    module.exports = SceneTransitions;
});
