define(function(require, exports, module) {

    var View = require('famous/core/View');

    /*
     *  Abstract class that defines the interface of the Modal view (e.g., item responsible for animating the
     *  selected item in z). This class is meant to be extended by child classes that fully implement the
     *  documented methods.
     *
     *  The front face of the modal must be represented by a Surface so that a copy of an Item's content/properties
     *  can be copied over. The modal can also include a backface used to display more detail.
     *
     *  @class Modal
     */
    function Modal() {
        View.apply(this, arguments);
    }

    Modal.DEFAULT_OPTIONS = {};

    Modal.prototype = Object.create(View.prototype);
    Modal.prototype.constructor = Modal;

// Methods to be implemented in child classes
    Modal.prototype.setFrontContent = function setFrontContent() {
    }
    Modal.prototype.animateIn = function animateIn() {
    }
    Modal.prototype.animateOut = function animateOut() {
    }

    module.exports = Modal;
});
