define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIFlipComponentAnimations = require('./UIFlipComponentAnimations');

    /***
     *  @example
     *      var flip = new UIFlipComponent({ 
     *          position: [this.options.padding, 40, 0],
     *          components: { 
     *              'play': new UIElement({ 
     *                  content: '<img src="../images/play.svg"/>',
     *                  size: [25, 25],
     *              }),
     *              'pause': new UIElement({ 
     *                  content: '<img src="../images/pause.svg"/>',
     *                  size: [25, 25],
     *              })
     *          }
     *      });
     *      
     *      flip.on('click', function(e) { 
     *          // e == 'play' || e == 'pause'
     *      });
     */
    var UIFlipComponent = UIComponent.extend({ 
        constructor: function UIFlipComponent (options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._components = options.components;
            this._state = {
                active: undefined
            }

            for (var key in this._components) {
                this._addChild(this._components[key]);
                this._components[key].setOpacity(0);
            }

            this._keys = Object.keys(this._components);
            this._boundToggle = this.toggle.bind(this);

            var defaultVisible = this.options.defaultVisible ? 
                this.options.defaultVisible : 
                this._keys[0];

            this.flipTo(defaultVisible);
            this._initEvents();
        },
        defaults: {
            components: {},
            defaultVisible: undefined,
            animation: 'rotateX'
        },
        _initEvents: function () {
            for (var key in this._components) {
                this._components[key].on('click', this._boundToggle);
            }
        },
        toggle: function () {
            var currentIndex = this._keys.indexOf(this._state.active);
            var newIndex = (currentIndex + 1) % this._keys.length;
            this.flipTo(this._keys[newIndex]);
        },
        _getRemaining: function () {
            var remainingObjects = [];
            for (var i = 0; i < this._keys.length; i++) {
                if (this._keys[i] !== this._state.active) {
                    remainingObjects.push(this._keys[i]);
                }
            };
            return remainingObjects;
        },
        flipTo: function (key) {
            var expiringKey = this._state.active;
            this.haltAll();
            this._state.active = key;
            var remaining = this._getRemaining();
            for (var i = 0; i < remaining.length; i++) {
                this._fadeOut(remaining[i]);
            };
            this._fadeIn(this._state.active);

            this.emit('flip', expiringKey);
        },
        haltAll: function () {
            for (var key in this._components) {
                this._components[key].halt();
            }
        },
        _fadeOut: function (componentKey) {
            this._fade('fadeOut', componentKey);
        },
        _fadeIn: function (componentKey) {
            this._fade('fadeIn', componentKey);
        },
        _fade: function (key, componentKey) {
            var anim = UIFlipComponentAnimations[this.options.animation];
            if (anim && anim[key]) {
                anim[key].call(this, this._components[componentKey]);
            }
            else throw new Error('No animation found by key ' + this.options.animation);
        },
        getSize: function () {
            if (this._state.active) {
                return this._components[this._state.active].getSize();
            }
        }
    });

    module.exports = UIFlipComponent;
});
