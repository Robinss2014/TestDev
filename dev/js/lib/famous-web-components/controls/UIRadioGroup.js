// TODO: refactor to follow UISlider style ~ Imti
define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement = require('../core/UIElement');
    var UIRadioIcon = require('./button/UIRadioIcon');
    var UIRadioGroup = UIComponent.extend( /** @lends UIComponent.prototype */ {

        /**
         * @method constructor
         * @param options
         */
        constructor: function(options) {
            options = options || {};
            this._callSuper(UIComponent, 'constructor', options);
            this._radioButtons   = options.radioButtons || [];

            this._widestButtonWidth = 0;

            this._update();
        },

        //TODO: make a collection inerface instead of the following.

        addButtons: function(arrayUiRadioButtons) {
            for (var i=0; i<arrayUiRadioButtons.length; i++) {
                this._radioButtons.push(arrayUiRadioButtons[i]);
            }
            this._update();
        },

        replaceButtons: function(arrayUiRadioButtons) { // NOTE: This is faster than addButtons when you want to set the entire button set.
            this._radioButtons = arrayUiRadioButtons;
            this._update();
        },

        removeButtons: function() {
            var array = this._radioButtons;
            this._radioButtons = [];
            this._update();
            return array;
        },

        getButtonAt: function(index) {
            return this._radioButtons[index];
        },

        getButtons: function() {
            return this._radioButtons;
        },

        _update: function() {

            for(var i = 0; i < this._radioButtons.length; i++) {

                var buttonSet = this;
                buttonSet._radioButtons[i].off('change'); // FIXME: this wastes CPU. check if event is already bound first?
                buttonSet._radioButtons[i].on('change', function() {
                    for (var j = 0; j<buttonSet._radioButtons.length; j++) {
                        if (j == buttonSet._radioButtons.indexOf(this)) {
                            buttonSet._radioButtons[j].setSelected(true, true);
                        }
                        else {
                            // FIXME: this wastes CPU. Only setSelected to false for the button that was previously selected.
                            buttonSet._radioButtons[j].setSelected(false, true);
                        }
                    }
                }.bind(buttonSet._radioButtons[i]));
            }
        }
    });

    module.exports = UIRadioGroup;
});
