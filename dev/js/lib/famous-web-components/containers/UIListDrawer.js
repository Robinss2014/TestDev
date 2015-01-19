define(function(require, exports, module) {
    var UIList = require('./UIStretchBox');
    var UIListDrawerAnimations = require('./UIListDrawerAnimations');
    var UIComponent = require('../core/UIComponent');
    var UIContainer = require('../containers/UIContainer');
    var UIAnimatedInStretchbox = require('./UIAnimatedInStretchbox');

    var UIListDrawer = UIContainer.extend({
        constructor: function UIListDrawer (options) {
            var children = options.children;
            options.children = null;
            this._callSuper(UIContainer, 'constructor', options);

            this._initialPosition = this.getPosition();
            this._visible = this.options.visible;

            this._stretchBox = new UIAnimatedInStretchbox({
                autoInitialize: false,
                direction: this.options.direction,
                children: children,
                padding: this.options.padding,
                size: this.getSize()
            });

            this.addChildAt(this._stretchBox, this._children.length);
            
            this._stretchBox.on('stretchBoxResize', this._onSizeChange.bind(this)); 
        },
        defaults: {
            offset: [20, 20],
            direction: 'y',
            showTransition: 'translateLeft',
            hideTransition: 'offscreenLeft',
            itemInit: 'scaleX',
            itemAnimationIn: 'rotateIn',
            itemAnimationOut: 'scaleX',

            visible: true
        },
        _onSizeChange: function () {
        },
        addChild:function (child) {
            return this._stretchBox.addChild(child);
        },
        removeChild: function (child) {
            return this._stretchBox.removeChild(child);
        },
        toggleVisible: function () {
            this.setVisible(!this._visible);
        },
        setVisible: function (bool) {
            this._visible = bool;
            if (this._visible) this.show();
            else this.hide();
        },
        show: function () {
            this._visible = true;
            
            this.halt();
            this.setOpacity(1, {
                curve: 'outExpo',
                duration: 400
            });
            var animation = UIListDrawerAnimations.show[this.options.showTransition];
            if (animation) animation.call(this, this._initialPosition);
            if (this.options.itemAnimationIn) this.animateItems(this.options.itemAnimationIn);
        },
        hide: function () {
            this._visible = false;
            
            this.halt();
            var animation = UIListDrawerAnimations.hide[this.options.hideTransition];
            if (animation) animation.call(this);
            if (this.options.itemAnimationOut) this.animateItems(this.options.itemAnimationOut);
        },

        animateItems: function (key) {
            this._stretchBox.animate(key);
        }
    });

    module.exports = UIListDrawer;

});
