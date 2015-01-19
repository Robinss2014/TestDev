define(function(require, exports, module) {

    var View           = require('famous/core/View');

    /*
     *  Abstract class that defines the interface of additional detail that accompanies the modal.
     *  This class is meant to be extended by child classes that fully implement the documented methods.
     *
     *  @class AdditionalDetail
     */
    function AdditionalDetail () {
        View.apply(this, arguments);
    }

    AdditionalDetail.DEFAULT_OPTIONS = {};

    AdditionalDetail.prototype = Object.create( View.prototype );
    AdditionalDetail.prototype.constructor = AdditionalDetail;

    // Methods to be implemented in child classes
    AdditionalDetail.prototype.animateIn = function animateIn () {}
    AdditionalDetail.prototype.animateOut = function animateOut () {}
    AdditionalDetail.prototype.updateContent = function updateContent () {}
    AdditionalDetail.prototype.setSize = function setSize () {}


    module.exports = AdditionalDetail;

});