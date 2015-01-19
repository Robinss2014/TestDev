define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement = require('../core/UIElement');
    var UILabel = require('./UILabel');

    var UIListRenderer = UIComponent.extend(/** @lends UIComponent.prototype */{
        /**
         * Default item renderer for UIList.
         *
         * @class UIListRenderer
         * @uses UIComponent
         * @constructor
         *
         * @param {Object} [options] options to be applied to UIListRenderer.
         */
        constructor: function UIListRenderer(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._height = this.getSize()[1];
            this._width = this.getSize()[0];
            this._internalNode = new UIComponent({
                origin: [0.5, 0.5],
                align: [0.5, 0.5]
            });

            this._padding = 18;
            this._background = new UIElement({
                // classes: ['UIListItem']
                style: {
                    backgroundColor: 'rgb(244, 239, 233)',
                    borderRadius: '7px'
                }
            });

            this._label = new UILabel({
                classes: ['UIListLabel'],
                position: [this._height + (this._padding / 2), this._padding, 1],
                size: [this._width - (this._height + this._padding), undefined]
            });

            this._image = new Image();
            this._image.style.borderRadius = '0px';
            this._image.width = this._height - (this._padding * 2);
            this._image.height = this._height - (this._padding * 2);

            this._imageEl = new UIElement({
                position: [this._padding, this._padding, 1],
                content: this._image,
                size: [this._height, this._height]
            });

            this._addChild(this._internalNode);
            this._internalNode._addChild(this._label);
            this._internalNode._addChild(this._imageEl);
            this._internalNode._addChild(this._background);

            this.on('click', this._handleClick.bind(this));

            if(options.item) this.setItem(options.item)
        },

        /**
         * Handler for click events on component.  Calls setSelected on self and emits
         * event for UIList to adjust current selected index.
         *
         * @method _handleClick
         */
        _handleClick: function _handleClick() {
            this.setSelected();
            this.emit('selected', this);
        },

        /**
         * Adjusts internal CSS properties in response to selection.
         *
         * @method setSelected
         */
        setSelected : function setSelected() {
            this._background.addClass('UIListItem-selected');
        },

        /**
         * Adjusts internal CSS properties in response to deselection.
         *
         * @method deselect
         */
        deselect : function deselect() {
            this._background.removeClass('UIListItem-selected');
        },

        /**
         * Function called on 'swap' of renderer from UIList.
         *
         * @method animateIn
         */
        animateIn : function animateIn() {},

        /**
         * Passes item to renderer which decides how to render the item visually.
         *
         * @method setItem
         * @param {Object} [item] Item that will be represented by the renderer.
         */
        setItem : function setItem(item) {
            this._label.setText(item.label);
            if(item.imageURL) this._image.src = item.imageURL;
        }
    });

    module.exports = UIListRenderer
});
