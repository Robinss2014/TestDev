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

    var UICheckBoxIcon = UIComponent.extend( /** @lends UIComponent.prototype */ {
        _size: [18,18],
        _boxColor: 'green',
        _checkColor:'blue',

        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._applyOptions(options);
            // Set user defined style or defaults
            this.setSize(this._size);
            var w = this._size[1];

            // Define sizes of elements
            this._boxSize = [w, w];
            this._checkSize = [Math.floor(w*3/5), Math.floor(w*7/6)];

            // We create our box with the necessary style and add it to ourself
            this._createCheckBoxBackground();
            this._createBox();

        },

        /**
         * Created check box
         *
         * @protected
         * @method _createBox
         */
        _createBox: function (options2){
            this._box = new UIElement({
                size: this._boxSize,
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                style:{
                    border: 'solid 2px',
                    borderColor: this._boxColor
                }
            });
            this._addChild(this._box);
        },

        /**
         * Creates the checkbox bacground
         *
         * @protected
         * @method _createCheckBoxBackground
         */
        _createCheckBoxBackground: function (){
            this._backgroundElement = new UIElement({
                size: [48, 48],
                opacity: '0',
                style: {
                    borderRadius: 24 + 'px',
                    background: this._checkColor,
                }
            });
            this._addChild(this._backgroundElement.center());
        },
        /**
         *  Animate the Icon on mouseover event
         * @public
         * @method setPressed
         */
        setPressed : function (pressed, animate) {
            // Background flashes on click
            this._backgroundElement.halt();

            if(animate) {
                if(pressed){
                    this._backgroundElement.setOpacity(0.2, {
                        duration : 80, curve: 'outBack'
                    });
        
                }else {
                    this._backgroundElement.setOpacity(0, { duration : 200, curve: Easing.outBack });

                }
            }
        },
        /**
         *  Animate the Icon on setSelected event
         * @public
         * @method setSelected
         */

        setSelected: function(select,animate){

            this._selected = select;
           
            var resizeDuration = animate ? 100 : 0;
            var rotateDuration = animate ? 60 : 0;
            this._backgroundElement.halt();
            this._box.halt();
            
                // Scale down/up when the user clicks
                if(!this._selected){
                    this._backgroundElement.setOpacity(0, { duration : 200, curve: Easing.outBack });
                    this._box.setSize(0, 0 ,{
                        duration : resizeDuration
                    }, function(){
                        this._box.setOrigin([0.5, 0.5], { duration: rotateDuration });
                        this._box.setRotation(0, 0, 0,{
                            duration : rotateDuration
                        });
                        this._box.setStyle({
                            borderTop: 'solid 2px'+this._boxColor,
                            borderLeft: 'solid 2px'+this._boxColor,
                            borderColor: this._boxColor
                        });
                        this._box.setSize(this._boxSize[0], this._boxSize[1], { duration : resizeDuration });
                        // this._beingAnimated = false;
                    }.bind(this));

                } else {
                    this._backgroundElement.setOpacity(0, { duration : 200, curve: Easing.outBack });
                    this._box.setRotation(0, 0, Math.PI/4,{
                        duration : rotateDuration
                    },function(){
                        this._box.setStyle({
                            borderColor: this._checkColor,
                            borderTop: '0px',
                            borderLeft: '0px'
                        });
                        this._box.setOrigin([0.33, 0.65], { duration: 50 });
                    }.bind(this));

                    this._box.setSize(0, 0 ,{
                        duration : resizeDuration
                    },function(){
                        // this._beingAnimated = false;
                        this._box.setSize(this._checkSize[0], this._checkSize[1], { duration : resizeDuration/2 });
                    }.bind(this));

                }
               
               
            
        }

    });

    module.exports = UICheckBoxIcon;
});
