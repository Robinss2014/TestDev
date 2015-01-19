define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement   = require('../core/UIElement');

    var UIFlash = UIComponent.extend( /** @lends UIComponent.prototype */ {
        /*
        * A Flash component that creates an ink effect when a 'flash' event is emitted
        *
        * @name Flash Component
        * @constructor
        *
        * @param {Object} options to applied to UIFlash
        * @param {Array} [options.size] flash size
        * @param {String} [options.color] flash color
        * @param {Number} [options.opacity] flash opacity
        */
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            // options style
            options          = options          || {};
            this._size       = options.size     || [100, 100];
            this._color      = options.color    || 'purple';
            this._opacity    = options.opacity  || 0.4;

            // Create UIElements and bind events
            this._createFlash();
            this._bindEvents();
        },

        /**
         * Creates a flash UIElement
         *
         * @protected
         * @method _createFlash
         */
        _createFlash: function () {
            this._flashElement = new UIElement({
                size: this._size,
                origin: [0.5, 0.5],
                opacity: 0,
                style: {
                    backgroundColor: this._color,
                    borderRadius: this._size[0] + 'px'
                }
            });
            this._addChild(this._flashElement);
        },

        /**
         * Bind Events
         *
         * @protected
         * @method _bindEvents
         */
        _bindEvents: function () {
            this.on('flash', function(e) {
               this._flash({x: e.x, y: e.y});
            }.bind(this));
        },

        /**
         * Creates flash animation
         *
         * @protected
         * @method _flash
         *
         * @param {Object} pos position object with x and y
         *   properties
         */
        _flash: function(pos) {
            this._isFlashing = true;
            this._flashElement.setPosition(pos.x, pos.y, 0);
            this._flashElement.setOpacity(this._opacity, { duration: 100 }, function() {
                this._flashElement.setOpacity(0, { duration: 100 });
            }.bind(this));
        }
    });
    module.exports = UIFlash;
});
