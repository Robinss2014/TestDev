define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');

    function EmptyView() {
        View.apply(this, arguments);
        _createViews.call(this);
        _setListeners.call(this);
    }

    EmptyView.prototype = Object.create(View.prototype);
    EmptyView.prototype.constructor = EmptyView;

    EmptyView.DEFAULT_OPTIONS = {};

    function _createViews() {

    }

    function _setListeners() {

    }

    module.exports = EmptyView;
});