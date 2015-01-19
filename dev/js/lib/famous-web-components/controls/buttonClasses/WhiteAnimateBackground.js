define(function(require, exports, module) {
    var UIComponent = require('../../core/UIComponent');
    var UIElement = require('../../core/UIElement');
    var Easing = require('famous/transitions/Easing');
        /**
         * A Check box button class
         *
         * @param {Object} [options] options to be applied to the button
         * @param {Array | Numbers} [options.size] Size of bounding box
         * @param {Boolean} [options.selected] Selected status
         *
         * @example
         *  var CheckBoxIcon = new UICheckBoxIcon({
         *      size: [30, 30],
         *      selected: true 
         *  });
         *
         * @class UICheckBoxIcon
         * @constructor
         */

    var WhiteAnimateBackground = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._backgroundImage   = options.backgroundImage || '',
            this._background        = options.background    || 'rgba(255,255,255,1)';
            this._border            = options.border        || '2px' ;
            this._borderRadius      = options.borderRadius  || '';
            this._raised            = options.raised        || false;
            this._boxShadow         = options.boxShadow     || this._raised? '2px 2px 0px 2px rgba(0, 0, 0, 0.5)': '';
            this._type              = options.type          || ""
            this._zIndex            = options.zIndex        || 0
            this._createRippleElement();
            this._createAnimateElement();
        },

        /**
         * Created check box
         *
         * @protected
         * @method _createBox
         */
        _createRippleElement: function (){
            this._backgroundElement = new UIElement({
                size : this.getSize(),
                style: {
                    zIndex : this._zIndex+'',
                    border : this._border,
                    backgroundSize : this._backgroundSize,
                    background : this._background,
                    borderRadius : this._borderRadius,
                    boxShadow : this._boxShadow,
                }
            });
            this._addChild(this._backgroundElement);
        },
        _createAnimateElement : function() {

            this._animatedElement = new UIElement({
                size : [0,0],
                origin: [0.5,0.5],
                align : [0.5,0.5],
                style : {
                    zIndex : (this._zIndex+1)+'',
                    background : '#fff',
                }
            });
            this._addChild(this._animatedElement);
        },

        /**
         *  Animate the Icon on mouseover event
         * @public
         * @method setPressed
         */
        setPressed : function (pressed, animate, event) {
            // Background flashes on click
            if(animate) {
                if(pressed) {
                    this._animatedElement.setSize(this.getSize()[0],0);
                    this._animatedElement.setSize(this.getSize()[0],this.getSize()[1]-5,{duration: 300, curve : Easing.outBounce})
                    this._parent._label.setStyle({
                        color : this._parent._background,
                    });
                    if(this._parent._icon && this._parent._icon._fontIcon){
                        this._parent._icon._fontIcon.setStyle({
                            color : this._parent._background,
                        });
                    }
                } else {
                    this._animatedElement.setSize(this.getSize()[0],0,{duration: 300, curve : Easing.outBounce})
                    this._parent._label.setStyle({
                        color : this._parent._textColor,
                    });
                    if(this._parent._icon && this._parent._icon._fontIcon){
                        this._parent._icon._fontIcon.setStyle({
                            color : this._parent._textColor,
                        });
                    }
                }
            }

        },
        /**
         *  Animate the Icon on setSelected event
         * @public
         * @method setSelected
         */

        setSelected: function(select,animate){
            console.log('background select');
        }

    });

    module.exports = WhiteAnimateBackground;
});
