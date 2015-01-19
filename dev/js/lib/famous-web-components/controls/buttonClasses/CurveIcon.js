define(function(require, exports, module) {

    var UIComponent = require('../../core/UIComponent');
    var UIElement = require('../../core/UIElement');
    var UICanvasElement = require('../../core/UICanvasElement');
    var Easing = require('famous/transitions/Easing');
    // var RaisedPressBackground    = require('./button/RaisedPressBackground')

    var CurveIcons = UIComponent.extend( /** @lends UIComponent.prototype */ {
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._backgroundImage   = options.backgroundImage || '',
            this._background        = options.background      || "#272822";
            this._zIndex            = options.zIndex          || 0;   
            this._color             = options.color           || '#33CCFF';
            this._curveFunc         = options.curveFunc       || Easing.linear;
            this._size              = this.options.size;
            this._createBackgroundElement();
        },

        defaults: {
            divisions: 50,
            padding: 10,
            size: [50, 50],
        },

        /**
         * Created check box
         *
         * @protected
         * @method _createBox
         */
        _createBackgroundElement: function (){
            this._backgroundElement = new UICanvasElement({
                size : this._size,
                style: {
                    zIndex : this._zIndex,
                }
            });
            this._addChild(this._backgroundElement);
            this._createCurves();
        },

        /**
         *  
         * @public
         * @method setPressed
         */
        _createCurves : function () {
            var ctx = this._backgroundElement.getContext('2d');

            var width = this._size[0] * 2; // retina
            var height = this._size[1] * 2; 

            if (this._background) {
                ctx.fillColor = this._background;
                ctx.fillRect(0,0, width, height );
            }

            width -= this.options.padding * 2;
            height -= this.options.padding * 2;

            var currentX, currentY, lastX, lastY;
            var minMaxes = this._findMinMaxes();
            var maxY = minMaxes.max;
            var minY = minMaxes.min;

            var scale = (maxY- minY);
            var max = this.options.divisions;

            ctx.strokeStyle = this._color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            
            for(var t = 0; t < max; t++) {
                var val = this._curveFunc(t/max);
                currentX = t * (width/max) + this.options.padding;
                currentY = height - ((val - minY)/scale) * height + this.options.padding;
                ctx.lineTo(~~currentX, ~~currentY);
            }
            ctx.stroke(); 
        },

        _findMinMaxes: function () {
            var values = {
                min: 0,
                max: 0
            };
            for(var i = 0; i < this.options.divisions; i++) {
                var j = this._curveFunc(i / this.options.divisions);
                if (values.max < j ) values.max = j;
                if (values.min > j) values.min = j;
            }
            return values;
        },

        setSelected : function (selected, animate, event) {
            if(selected){
                this._backgroundElement.setStyle({ border : '2px solid rgb(51, 204, 255)'})
            } else {
                this._backgroundElement.setStyle({ border : ''})
            }
        }
       
    });

    module.exports = CurveIcons;
});
