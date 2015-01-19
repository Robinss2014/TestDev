/*globals define*/
define(function(require, exports, module) {
    var UIElement = require('../../core/UIElement');
    var UIComponent = require('../../core/UIComponent');
    var UIContainer = require('../../containers/UIContainer');
    var Easing = require('famous/transitions/Easing');

    /**
     * A basic icon
     *
     * @name UIIconElement
     * @constructor
     *
     * @param {Object} [options] options to be set on UIIconElement
     * @param {icon} [String] icon to display
     * @param {Array} [options.size] button size
     * @param {Boolean} [options.classes] classes to be applied
     * @param {Object} [properties] CSS properties
     * @param {String} [color] color
     * @param {String} [textAlign] text orientation
     * @param {String} [fontSize] font size
     * @param {String} [lineHeight] lineheight 
     */
    module.exports = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {
            
            this.options = options || {};
            this._callSuper(UIComponent, 'constructor', options);

            this._icon =  options.iconName || 'ion-bug';
            this._size = options.size = options.size || [48, 48];
            this.options.style = options.style || {};
            this.options.style.zIndex    = (options.zIndex+10)+'';
            
            this._color = options.style.color = options.style.color || options.color;
            options.classes = options.classes? options.classes : [];
            this.options.classes = options.classes.concat([options.iconName]);
            this.options.style.textAlign = options.style.textAlign || 'center';
            this.options.style.fontSize = options.style.fontSize || options.size[1] + 'px';
            this.options.style.lineHeight = options.style.lineHeight || options.size[1] + 'px';
            

            this._createIconBox();
        },
        _createIconBox : function() {
            this._fontIcon = new UIElement(this.options);
            this._addChild(this._fontIcon.center());
        },
        //@@
        setPressed : function(pressed, animate, event) {
            if(this._icon === 'ion-heart') {
                if(pressed){
                    console.log('heart');
                    this._fontIcon.setStyle({ color : 'red'});
                    this._fontIcon.setScale(2,2,2,{duration : 100});
                    // this._fontIcon.setOpacity(0,{duration: 200});
                    this._fontIcon.setScale(1,1,1,{duration:100});

                } else {
                    
                    this._fontIcon.setStyle({color: this._color});
                }
            }
            if(this._icon === 'ion-email' && pressed) {
                console.log('email');
                // this.setAlign(0.5,0.5);
                var position = this.getPosition();
                this.halt();
                this._fontIcon.setRotation(0,0,Math.PI/4,{duration : 100 , curve : 'linear'});
                this._fontIcon.setRotation(0,0,-Math.PI/4,{duration : 200 , curve : 'linear'});
                this._fontIcon.setRotation(0,0,0,{duration : 100 , curve : 'linear'});


            }
            if(this._icon === 'ion-ios7-cart' && pressed) {
                var position = this.getPosition();
                this.setPosition(position[0]+90,position[1],0,{duration : 400});
                this._parent._label.setOpacity(0,{duration : 150});
                this.setOpacity(0,{duration: 400},function(){
                    this.setPosition(position[0],position[1],0);
                    this._parent._label.setOpacity(1,{duration : 200});
                    this.setOpacity(1,{duration: 100});
                }.bind(this));
            }
        }
    });
});
