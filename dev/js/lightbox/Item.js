define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Scrollview = require('famous/views/Scrollview');
    var Transitionable = require('famous/transitions/Transitionable');

    var SizeAwareView = require('famous-scene/SizeAwareView');

    /*
     *  Abstract class that defines the interface of Lightbox items (e.g., slides in 'browse mode').
     *  This class is meant to be extended by child classes that fully implement the documented methods.
     *
     *  The Item's content should be represented by a Surface so that a copy of its content/properties
     *  can be copied over to the modal. Overlays, decorations, and animations can be added on top of the
     *  Surface to create a richer visual presentation.
     *
     *  @class Item
     */
    function Item() {
        SizeAwareView.apply(this, arguments);
    }

    Item.DEFAULT_OPTIONS = {
        data: {} // Data used to create content
    };

    Item.prototype = Object.create(SizeAwareView.prototype);
    Item.prototype.constructor = Item;

// Methods to be implemented in child classes
    Item.prototype.getData = function getData() {
    };
    Item.prototype.getSize = function getSize() {
    };
    Item.prototype.setOpacity = function setOpacity(value, transition) {
    }
    Item.prototype.setScale = function setScale(value, transition) {
    }
    Item.prototype.getSurfaceContent = function getSurfaceContent() {
    }
    Item.prototype.getSurfaceProperties = function getSurfaceProperties() {
    }

    module.exports = Item;

});
