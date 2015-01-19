define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement   = require('../core/UIElement');


    var UITooltip = UIComponent.extend( /** @lends UIComponent.prototype */ {
        /**
         * A basic tooltip
         *
         * @name UITooltip
         * @constructor
         *
         * @param {Object} [options] options to be set on UITooltip
         */
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._backgroundElement = new UIElement({
                content: this.options.text,
                size: [true, true],
                style: this.options.style
            });
            this._addChild(this._backgroundElement);
            this.setSize(true, true);
            this.setScale([0, 0]);
            if (this.options.visible) {
                this.show();
            }
        },

        defaults: {
            style: { 
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                margin: '0px',
                borderRadius: '5px',
                padding: '12px'
            },
            text: 'This is a tooltip',
            visible: false
        },

        setStyle: function (style) {
            this._backgroundElement.setStyle(style);
        },

        setClasses: function (classes) {
            this._backgroundElement.setClasses(classes);
        },

        setText: function(text) {
            this._backgroundElement.setContent(text);
        },

        getText: function(text) {
            return this._backgroundElement.getContent();
        },

        show: function(transition, callback) {
            this.options.visible = true;
            transition = transition || {
                duration: 250,
                curve: 'outExpo'
            };
            this.halt();
            this.setOpacity(1, transition, callback);
            this.setScale([1, 1], transition, callback);
        },

        hide: function(transition, callback) {
            this.options.visible = false;
            transition = transition || {
                duration: 250,
                curve: 'inExpo'
            };
            this.halt();
            this.setOpacity(0, transition, callback);
            this.setScale([0, 0], transition, callback);
        }
    });

    module.exports = UITooltip;
});
