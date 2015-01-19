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

    var RaisedPressBackground = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._backgroundImage   = options.backgroundImage || '',
            this._background        = options.background    || 'rgba(255,255,255,1)';
            this._border            = options.border        || '' ;
            this._borderRadius      = options.borderRadius  || '';
            this._raised            = options.raised        || false;
            this._boxShadow         = options.boxShadow     || this._raised ? '2px 2px 0px 0px rgba(255, 255, 255, 1)': '';
            this._zIndex            = options.zIndex        || 0
            this._createRippleElement();
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
                // content : "<img src="+this._backgroungImage+" >",
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

        /**
         *  Animate the Icon on mouseover event
         * @public
         * @method setPressed
         */
        setPressed : function (pressed, animate, event) {
            // Background flashes on click

            if(animate) {
                    var position = this._backgroundElement.getPosition();
                if(pressed) {
                    this._backgroundElement.setPosition(position[0]+2,position[1]+2,position[2]);
                    this._backgroundElement.setStyle({
                        boxShadow : '',
                    });
                } else {
                    this._backgroundElement.setPosition(position[0]-2,position[1]-2,position[2]);

                      this._backgroundElement.setStyle({
                        boxShadow : this._boxShadow,
                    });
                }
            }

        },
        /**
         *  Animate the Icon on setSelected event
         * @public
         * @method setSelected
         */

        setSelected: function(select,animate){
            
            if(select) {
                this._backgroundElement.setStyle({
                    border : '1px dotted black'});
            } else {
                this._backgroundElement.setStyle({
                        border : ''});

            }

                
            
        }

    });

    module.exports = RaisedPressBackground;
});
