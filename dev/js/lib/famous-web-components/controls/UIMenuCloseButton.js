define(function(require, exports, module) {
    var UIComponent = require('../core/UIComponent');
    var UIElement = require('../core/UIElement');
    var Transform = require('famous/core/Transform');

    var NUM_BARS = 3;

    var ANIMATIONS = { 
        fade: {
            close: function () {
                var delay = 100;
                var halfSize = [ 
                    this.options.size[0] * 0.5, 
                    this.options.size[1] * 0.5, 
                    0
                ];
                    
                this._elems[0].setDelay(delay);
                this._elems[0].setTransform(Transform.rotateZ(Math.PI * 0.25), this.options.closeTransition);

                this._elems[1].setTransform(Transform.scale(0,0), this.options.closeTransition);
                this._elems[1].setOpacity(0, this.options.closeTransition);

                this._elems[2].setDelay(delay);
                this._elems[2].setTransform(Transform.rotateZ(-Math.PI * 0.25), this.options.closeTransition); 
            },
            menu: function () {
                var halfSize = [ 
                    this.options.size[0] * 0.5, 
                    this.options.barHeight * 0.5
                ];

                this._elems[0].setTransform(Transform.translate(0, -this.options.barHeight - this._calcs.padding, 0), this.options.menuTransition);

                this._elems[1].setTransform(Transform.identity, this.options.menuTransition);
                this._elems[1].setOpacity(1, this.options.menuTransition);

                this._elems[2].setTransform(Transform.translate(0, this.options.barHeight + this._calcs.padding, 0), this.options.menuTransition);
            }
        }
    };

    var UIMenuCloseButton = UIComponent.extend({ 

        constructor: function UIMenuCloseButton (options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._calcs = {
                barSize: [undefined, undefined],
                padding: undefined
            }

            this._elems = [];
            this._components = [];
            this._state;

            this._calcBarHeight();
            this._init();
            if (this.options.defaultState == 'close') this.setClose();
            else this.setMenu();
        },

        defaults: {
            size: [60, 40],
            barHeight: 10,
            style: {
                'backgroundColor': '#404040',
                'borderRadius': '10px'
            },
            animation: 'fade',
            menuTransition: {
                curve: 'outExpo',
                duration: 400
            },
            closeTransition: {
                curve: 'inOutBack',
                duration: 400
            },
            defaultState: 'close'
        },

        _init: function () {
            for (var i = 0; i < NUM_BARS; i++) {
                var component = new UIComponent({
                    size: this.options.size,
                });
                var elem = new UIElement({ 
                    style: this.options.style,
                    origin: [0.5, 0.5],
                    align: [0.5, 0.5],
                    size: this._calcs.barSize
                });
                component._addChild(elem);
                this._addChild(component);
                this._elems.push(elem);
                this._components.push(component);
            };

            this._eventContainer = new UIElement({ 
                opacity: 0,
                style: { zIndex: 3 },
                classes: ['ui-menu-close-button']
            });
            this._addChild(this._eventContainer);
            
            this._eventContainer.on('click', this.toggle.bind(this));
        },

        _calcBarHeight: function () {
            this._calcs.barSize[0] = this.options.size[0]; 
            this._calcs.barSize[1] = this.options.barHeight;
            this._calcs.padding = 
                (this.options.size[1] - this.options.barHeight * NUM_BARS) / 
                (NUM_BARS - 1);
        },

        setClose: function () {
            this._state = "CLOSE";
            this._haltAll();

            var halfSize = [ 
                this.options.size[0] * 0.5, 
                this.options.size[1] * 0.5, 
                0
            ];

            ANIMATIONS[this.options.animation].close.call(this);
            this.emit('close');
        },

        setMenu: function () {
            this._state = "MENU";
            this._haltAll();
            var halfSize = [ 
                this.options.size[0] * 0.5, 
                this.options.barHeight * 0.5
            ];

            ANIMATIONS[this.options.animation].menu.call(this);
            this.emit('menu');
        },

        _haltAll: function () {
            for (var i = 0; i < this._elems.length; i++) {
                this._elems[i].halt();
            };
        },

        toggle: function () {
            if (this._state === 'MENU') this.setClose();
            else this.setMenu();
        }

    });

    module.exports = UIMenuCloseButton;
});
