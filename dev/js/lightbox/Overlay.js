define(function(require, exports, module) {

    var View = require('famous/core/View');

    /*
     *  Abstract class that defines the overlay that is displayed whenever the user
     *  hovers over an item in the lightbox.
     *
     *  @class Overlay
     */
    function Overlay() {
        View.apply(this, arguments);
    }

    Overlay.DEFAULT_OPTIONS = {};

    Overlay.prototype = Object.create(View.prototype);
    Overlay.prototype.constructor = Overlay;

// Methods to be implemented in child classes
    Overlay.prototype.setSize = function setSize() {
    }
    Overlay.prototype.setContent = function setContent() {
    }
    Overlay.prototype.setPosition = function setPosition() {
    }
    Overlay.prototype.display = function display() {
    }
    Overlay.prototype.hide = function hide() {
    }
    Overlay.prototype.animateClick = function animateClick() {
    }

    module.exports = Overlay;
});
