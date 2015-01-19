define(function(require, exports, module) {
    var UIScaleSlider = require('./UIScaleSlider')
    var UIElement = require('../core/UIElement');
    var UILabel = require('./UILabel');
    var Utils = require('../utils/Utils');

    /**
     *  A scale slider with a text label component.
     *
     *  Ellipsis on the label css:
     *  @example
     *      .ui-slider-text {
     *          font-family: Avenir, sans-serif;
     *          font-weight: 800;
     *          text-transform: uppercase;
     *          overflow: ellipsis;
     *          color: #000;
     *          overflow: hidden;
     *          white-space: nowrap;
     *          text-overflow: ellipsis;
     *          font-size: 12px;
     *      }
     *  
     *  @class TextSlider
     *  @extends UIScaleSlider
     */
    var TextSlider = UIScaleSlider.extend({ 
        /**
         * @method constructor
         * @param options
         */
        _text: 'Slider',
        _textClasses: ['ui-slider-text'],
        _textStyle: {
            zIndex: 3
        },
        _padding: [5, 5],

        constructor: function ScaleSlider (options) {
            this.defaults = Utils.merge(UIScaleSlider.prototype.defaults, this.defaults);
            this._callSuper(UIScaleSlider, 'constructor', options);
            this._applyOptions(options);

            this._label = new UILabel({
                text: this._text,
                classes: this._textClasses,
                position: [this._padding, this._padding, 0],
                style: this._textStyle
            });
            var self = this;
            this._label.on('sizeChange', function (e) { 
                var size = self.getSize();
                var labelSize = e.getSize();
                self.setSize([size[0],  labelSize[1] + self._padding[1] * 2]);
                self._label.setSize([size[0] - self._padding[0] * 2, undefined]);
                self.emit('sizeChange', self);
            });
            this._addChild(this._label);
        },

        setTextStyle: function (obj) {
            this._textStyle = obj;
            this._label.setStyle(this._textStyle);
        },
        setTextClasses : function (arr) {
            this._textClasses = arr;
            this._label.setClasses(this._textClasses);
        },
        setText: function (text) {
            this._text = text;
            this._label.setText(this._text);
        }
    });

    module.exports = TextSlider;
});
