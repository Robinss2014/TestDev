define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement   = require('../core/UIElement');

    var UIFab = UIComponent.extend( /** @lends UIComponent.prototype */ {
        /**
         * A fab icon
         *
         * @name UIFab
         * @constructor
         *
         * @param {Object} [options] options to be set on UIBoundingBox
         * @param {Number} [options.radius] radius of fab
         * @param {Number} [options.shadowDepth] depth of box shadow
         * @param {String} [options.radius] fab radius
         */
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            this._createBackground();
            this._createIcon();
        },

        defaults: {
            size: [25, 25],
            shadowDepth: 5,
            iconColor: 'rgba(255, 255, 255, 0.95)',
            background: '#0066cc',
            icon: 'ion-hammer',
            iconSize: 15
        },

        /**
         * Creates background
         *
         * @protected
         * @method _createBackground
         */
        _createBackground: function(options) {
            this._backgroundElement = new UIElement({
                style: {
                    boxShadow: this._shadowDepthToBoxShadow(this.options.shadowDepth),
                    background: this.options.background,
                    borderRadius: '50%'
                }
            });
            this._addChild(this._backgroundElement);
            this._backgroundElement.pipe(this);
        },

        /**
         * Creates icon
         *
         * @protected
         * @method _createIcon
         */
        _createIcon: function() {
            this._iconElement = new UIElement({
                style: {
                    textAlign: 'center',
                    color: this.options.iconColor,
                    fontSize: this.options.iconSize + 'px',
                    lineHeight: this.options.size[1] + 'px',
                    cursor: 'pointer'
                },
                classes: ['icon', this.options.icon]
            });
            this._addChild(this._iconElement);
            this._iconElement.pipe(this);
        },

        /**
         * Converts shadow depth to CSS box shadow format
         *
         * @protected
         * @method _shadowDepthToBoxShadow
         *
         * @param {Number} shadowDepth depth of box shadow
         * @return {String} CSS box shadow
         */
        _shadowDepthToBoxShadow: function(shadowDepth) {
            return '0 0 ' + shadowDepth + 'px rgba(0, 0, 0, 0.45)';
        }
    });

    module.exports = UIFab;
});
