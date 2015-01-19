define(function(require, exports, module) {
    var UIContainer = require('../containers/UIContainer');
    var UIButton = require('./UIButton');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransitionableUpdate = require('../utils/TransitionableUpdate');
    var Transform = require('famous/core/Transform');

    var UIDropdownAnimations = {
        translate: { 
            open: function (child, offset) {
                child.halt();
                child.setPosition(offset, this._transition);
                child.setOpacity(1, curve);
            },
            closeSelected: function (child) {
                child.halt();
                child.setPosition(0,0,0, this._transition);
            },
            closeHidden: function (child) {
                child.halt();
                child.setPosition(0,0,0, this._transition);
                child.setOpacity(0, this._transition);
            }
        },
        rotateY: { 
            open : function (child, offset) {
                child.halt();
                var size = child.getSize();
                if (child !== this.getSelectedChild()) {
                    child.setTransform(Transform.thenMove(Transform.rotateX(Math.PI * 0.5), [0, 0]));
                }
                child.setTransform(Transform.translate(offset[0], offset[1], offset[2]), this._transition);
                child.setOpacity(1, this._transition);
            },
            closeSelected: function (child) {
                child.halt();
                child.setTransform(Transform.identity, this._transition);
            },
            closeHidden: function (child, index) {
                child.halt();
                var size = child.getSize();
                child.setTransform(
                    Transform.multiply(Transform.thenMove(Transform.rotateX(Math.PI * 0.5),[size[0] * 0.5, size[1] * 0.5, -25]), Transform.scale(0.1, 0.1, 1)), 
                    this._transition);

                child.setOpacity(0, this._transition);
            }
        },
        empty: { 
            open : function (child, offset) {

            },
            closeSelected: function (child) {
                
            },
            closeHidden: function (child) {
                
            }
        }
    };

    /**
     *  @class UIDropdown
     *  @extends UIContainer
     */
    var UIDropdown = UIContainer.extend({ 
        _direction: 'y',
        _animation: 'rotateY',
        _padding: 10,
        _defaultState: false,
        _defaultSelected: 0,
        _transition: { 
            curve: 'outBack',
            duration: 600
        },
        constructor: function UIDropdown (options) {
            this._callSuper(UIContainer, 'constructor', options);
            this._applyOptions(options);
            this._state = {
                opened: this._defaultState,
                selected: this._defaultSelected,
                size: [undefined, undefined]
            };
            if (options.onChange) {
                this._onChangeCallback = options.onChange;
            }
            this._sizeTransitionable = new TransitionableUpdate([0, 0], this._onSizeUpdate.bind(this));
        },
        /**
         * @method open
         */
        open: function () {
            this._state.opened = true;
            this._layout();
        },
        /**
         * @method close
         */
        close: function () {
            this._state.opened = false;
            this._layout();
        },
        /**
         * @method setValue
         * @param i
         */
        setValue: function (i) {
            var previousChild = this.getSelectedChild();
            var previousSelectedState = this._state.selected;

            this._state.selected = i;
            var child = this.getSelectedChild();

            var eventObj = {};
            eventObj.selected = (child.getID && typeof child.getID() !== 'number') ?
                child.getID() :
                this._state.selected;

            eventObj.previous = (previousChild.getID && typeof previousChild.getID() !== 'number') ?
                previousChild.getID() :
                previousSelectedState;

            this.emit('change', eventObj);
            if (this._onChangeCallback) this._onChangeCallback(eventObj);
        },

        /**
         * @method getValue
         */
        getValue: function () {
            return this._state.selected;
        },
        
        /**
         * @method _onSizeUpdate
         * @private
         */
        _onSizeUpdate: function () {
            this.emit('sizeChange', this);
        },

        /**
         * @method getSelectedChild
         */
        getSelectedChild: function () {
            return this.getChildren()[this._state.selected];
        },

        /**
         * @method setSelectedByChild
         * @param child
         */
        setSelectedByChild: function (child) {
            var children = this.getChildren();
            var index = children.indexOf(child);
            this.setValue(index);
            this.toggle();
        },

        /**
         * @method toggle
         */
        toggle: function () {
            this._state.opened = !this._state.opened;
            this._layout();
        },

        /**
         * @method addChild
         * @param child
         */
        addChild: function (child) {
            var self = this;
            child.on('sizeChange', function (e) { 
                self._layout();
                self.emit('sizeChange', self);
            });
            child.on('click', function (child) { 
                if (child == self.getSelectedChild()) {
                    self.toggle();
                } else {
                    self.setSelectedByChild(child);
                }
            }.bind(this, child));
            this._callSuper(UIContainer, 'addChild', child);
        },

        /**
         * @method getSize
         */
        getSize: function () {
            return this._sizeTransitionable.get();
        },

        //@@
        _updateSizeGetter: function (val) {
            this._sizeTransitionable.halt();
            this._sizeTransitionable.set(val, this._transition);
        },

        /**
         * @method _layout
         * @private
         */
        _layout: function () {
            if (this._state.opened) this._layoutOpen();
            else this._layoutClose();
        },

        /**
         * @method _layoutOpen
         * @private
         */
        _layoutOpen: function () {
            this._state.size = [0,0];
            var children = this.getChildren();
            var offset = [0, 0];
            var dir = this._direction === 'x' ? 0 : 1;
            var oppositeDir = this._direction === 'x' ? 1 : 0;
            var max = [0,0];
            
            for (var i = 0; i < children.length; i++) {
                var size = children[i].getSize();
                if (!size) continue;
                var child = children[i];

                UIDropdownAnimations[this._animation].open.call(this, child, offset, i);
                offset[dir] += size[dir] + this._padding;
                if (size[oppositeDir] > max[oppositeDir]) max[oppositeDir] = size[oppositeDir];
            };

            this._state.size[dir] = offset[dir];
            this._state.size[oppositeDir] = max[oppositeDir];
            this._updateSizeGetter(this._state.size);
            this.emit('sizeChange', this);
        },
        /**
         * @method _layoutClose
         * @private
         */
        _layoutClose: function () {
            this._state.size = [0,0];
            
            var children = this.getChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (i == this._state.selected) {
                    UIDropdownAnimations[this._animation].closeSelected.call(this, child, i);
                    this._state.size = child.getSize();
                    this._updateSizeGetter(this._state.size);
                }
                else {
                    UIDropdownAnimations[this._animation].closeHidden.call(this, child, i);
                }
            };
            this.emit('sizeChange', this);
            
        },
    });

    module.exports = UIDropdown;
});
