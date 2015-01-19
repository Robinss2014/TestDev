define(function(require, exports, module) {
    var UIStretchbox = require('./UIStretchBox');
    var UIComponent = require('../core/UIComponent');
    var Utils = require('../utils/Utils');
    var Timer = require('famous/utilities/Timer');
    var Engine = require('famous/core/Engine');
    var Transform = require('famous/core/Transform');
    var Easing = require('famous/transitions/Easing');
    var UIAnimatedInStretchboxAnimations = require('./UIAnimatedInStretchboxAnimations');

    var UIAnimatedInStretchbox = UIStretchbox.extend({ 

        constructor: function (options) {
            this.defaults = Utils.extend(UIStretchbox.prototype.defaults, this.defaults);

            this._parentComponents = [];
            this._childComponents = [];
            this._controlledChildren = [];
            this._boundListeners = [];
            
            this._callSuper(UIStretchbox, 'constructor', options);

            this.setOpacity(0);
            this.setOpacity(1, {
                curve: 'outExpo',
                duration: 500
            });

            if (this.options.autoInitialize) this.animateIn();
        },

        defaults: {
            opacityTransition: {
                duration: 200
            },
            scaleTransition: {
                curve: 'outExpo',
                duration: 500
            },
            autoInitialize: true,
            animationDuration: 300,

            animationInit: 'scaleX',
            animationIn: 'rotateIn',
            animationOut: 'scaleOut'
        },

        addChild: function (child) {
            var parentComponent = new UIComponent({
                size: child.getSize()
            });
            var childComponent = new UIComponent();

            var boundFn = function (e) { 
               this.setSize(child.getSize());
               this.emit('sizeChange', this);
            }.bind(parentComponent);

            child.on('sizeChange', boundFn);
            
            this._childComponents.push(childComponent);
            this._parentComponents.push(parentComponent);
            this._controlledChildren.push(child);
            this._boundListeners.push(boundFn);

            parentComponent._addChild(childComponent);
            childComponent._addChild(child);

            UIAnimatedInStretchboxAnimations[this.options.animationInit].call(this, parentComponent, childComponent);
            this._callSuper(UIStretchbox, 'addChild', parentComponent);
        },
        removeChild: function (child) {
            var index = this._controlledChildren.indexOf(child);
            var parentComponent = this._parentComponents[index];

            this._parentComponents.splice(index, 1);
            this._childComponents.splice(index, 1);
            this._controlledChildren.splice(index, 1);

            var boundFn = this._boundListeners[index];
            parentComponent.off('sizeChange', boundFn);

            this._callSuper(UIStretchbox, 'removeChild', parentComponent);
        },
        halt: function () {
            for (var i = 0; i < this._childComponents.length; i++) {
                this._childComponents[i].halt();
                this._parentComponents[i].halt();
            };
        },

        /**
         *  Get all child components.
         *  @method getChildren
         */
        getChildren: function () {
            return this._controlledChildren;
        },

        /**
         * Trigger generic animation
         * @method animate
         */
        animate: function (key) {
            if (!key) key = this.options.animationIn;
            this._startAnimation(key);
        },

        /**
         *  Trigger default animationIn or custom one.
         *  @method animateIn
         */
        animateIn: function (key) {
            if (!key) key = this.options.animationIn;
            this._startAnimation(key);
        },

        /**
         *  Trigger default animationIn or custom one.
         *  @method animateOut
         */
        animateOut: function (key) {
            if (!key) key = this.options.animationOut;
            this._startAnimation(key);
        },

        /**
         *  @method _startAnimation
         *  @protected
         */
        _startAnimation: function (key) {
            this.halt();
            for (var i = 0; i < this._childComponents.length; i++) {
                var parent = this._parentComponents[i];
                var child = this._childComponents[i];
                UIAnimatedInStretchboxAnimations[key].call(this, parent, child, i );
            };
        },
        
    });


    module.exports = UIAnimatedInStretchbox;
});
