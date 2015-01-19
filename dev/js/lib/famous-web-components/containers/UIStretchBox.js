define(function(require, exports, module) {
    var UIContainer         = require('./UIContainer');
    var UIBoundingBox       = require('../controls/UIBoundingBox');
    var Engine              = require('famous/core/Engine');
    var UIElement           = require('../core/UIElement');
    var Easing              = require('famous/transitions/Easing');
    var Transitionable      = require('famous/transitions/Transitionable');

    var UIStretchBox = UIContainer.extend(/** @lends UIContainer.prototype */{
        /**
         * StretchBox is like grid with either a single row or a single column. The size of each cell is the size of it's corresponding child unless evenlySpaced is true,
         * in which case the cells are the same size.
         *
         * e.g. A StretchBox with direction set to "x", evenlySpaced set to false.
         *  +-----+-----+-------+--------+------------+---------+----+
         *  | one | two | three | bigger | evenBigger | smaller | :) |
         *  +-----+-----+-------+--------+------------+---------+----+
         *
         * e.g. A StretchBox with direction set to "x", evenlySpaced set to true.
         *  +------------+------------+------------+------------+------------+------------+------------+
         *  |     one    |     two    |   three    |   bigger   | evenBigger |   smaller  |    :)      |
         *  +------------+------------+------------+------------+------------+------------+------------+
         *
         * e.g. A StretchBox with direction set to "y", evenlySpaced set to false.
         *  +------------+
         *  |    one     |
         *  +------------+
         *  |    two     |
         *  +------------+
         *  |   three    |
         *  +------------+
         *  |   bigger   |
         *  +------------+
         *  |    even    |   <-- This cell is taller.
         *  |   bigger   |
         *  +------------+
         *  |  smaller   |
         *  +------------+
         *  |     (:     |
         *  +------------+
         *
         * e.g. A StretchBox with direction set to "y", evenlySpaced set to true.
         *  +------------+
         *  |    one     |
         *  |            |
         *  +------------+
         *  |    two     |
         *  |            |
         *  +------------+
         *  |   three    |
         *  |            |
         *  +------------+
         *  |   bigger   |
         *  |            |
         *  +------------+
         *  |    even    |   <-- All cells the same size along the directional axis.
         *  |   bigger   |
         *  +------------+
         *  |  smaller   |
         *  |            |
         *  +------------+
         *  |     (:     |
         *  |            |
         *  +------------+
         *
         * @class UIStretchBox
         * @uses UIContainer
         * @constructor
         *
         * @param {Object} [options] options to be applied to underlying
         *    UIElement
         */
        constructor: function UIStretchBox(options) {
            if (!options) options = {};
            this._direction = options.direction || 'x';
            this._padding   = options.padding || 0;
            this._evenlySpaced = options.evenlySpaced || false;

            this._animating = [];
            this._removalQueue = [];
            this._inAnimation = options.inAnimation || null;
            this._outAnimation = options.outAnimation || null;
            this._spacers = {};
            this._lowestIndex = 0;
            this._largestChildSize = [0,0];

            this._bindAddToAnimating = this._addToAnimating.bind(this);
            this._bindRemoveFromAnimating = this._removeFromAnimating.bind(this);
            this._bindQueueReflow = this._queueReflow.bind(this);

            this._callSuper(UIContainer, 'constructor', options);

            // this._addChild(new UIElement({ style: { border: '3px dotted white' }}));
        },

        /**
         * This method is called by the Engine every tick.  Before rendering, UIStretchBox
         * iterates through all of it's children who are currently animating and determines
         * from which element it must start the reflow.
         *
         * @method render
         */
        render: function () {
            if(this._animating.length){
                this._lowestIndex = this._children.length - 1;
                var i;
                var animatingLength = this._animating.length;
                for (i = 0; i < animatingLength; i++) {
                    if(this._animating[i] < this._lowestIndex) this._lowestIndex = this._animating[i];
                }
                this._reflow(this._lowestIndex);

                var removalQueueLength = this._removalQueue.length;
                for (i = 0; i < removalQueueLength; i++) {
                    this._removeFromAnimating(this._removalQueue[i]);
                }

                if(removalQueueLength) this._removalQueue = [];
            }

            return this._callSuper(UIContainer, 'render');
        },

        /**
         * Calls UIContainer's addChildAt method and adds size update listeners on added child.
         *
         * @method addChildAt
         */
        addChildAt: function (child, index) {
            this._callSuper(UIContainer, 'addChildAt', child, index);

            child.on('sizeChange', this._bindQueueReflow);
            child.on('sizeTransitionStart', this._bindAddToAnimating);
            child.on('sizeTransitionEnd', this._bindRemoveFromAnimating);

            if(this._inAnimation) {
                var layoutDirection =  + (this._direction === 'y');
                var childSize = child.getSize();
                var startSize = layoutDirection ? [childSize[0], 0] : [0, childSize[1]];

                this._spacers[child] = new Transitionable([0, 0]);
                this._spacers[child].set(childSize, this._inAnimation, this._removeSpacer.bind(this, child));
                this._addToAnimating(child);
                child.setSize(startSize);
                child.setSize(childSize, this._inAnimation);
            }
            this._queueReflow(child);
        },

        /**
         * Calls UIContainer's removeChildAt method and removes size update listeners on removed child.
         *
         * @method removeChildAt
         */
        removeChildAt: function (index) {
            var child = this._children[index];

            if(this._outAnimation) {
                var layoutDirection =  + (this._direction === 'y');
                var childSize = child.getSize();
                var endSize = layoutDirection ? [childSize[0], 0] : [0, childSize[1]];
                child.setSize([0, 0], this._outAnimation, this._removeChildAt.bind(this, index));
            } else {
                this._callSuper(UIContainer, 'removeChildAt', index);
            }

            child.off('sizeChange', this._bindQueueReflow);
            child.off('sizeTransitionStart', this._bindAddToAnimating);
            child.off('sizeTransitionEnd', this._bindRemoveFromAnimating);

            this._queueReflow(child);
        },

        /**
         * Removes child next animation frame.
         *
         * @method _removeChildAt
         */
        _removeChildAt: function (index) {
            Engine.nextTick(function(index){
                this._callSuper(UIContainer, 'removeChildAt', index);
            }.bind(this, index));
        },

        /**
         * Adds child index to queue of children who size is changing without transition.
         *
         * @method handleChildSizeChange
         */
        _queueReflow: function (child) {
            var index = this._childHash[child];

            if (this._animating.indexOf(index) !== -1) return;

            this._addToAnimating(child);
            this._removalQueue.push(child);
        },

        /**
         * Lays out all children based on their respective sizes.  Sets self size based on its children.
         * If child is passed as parameter setTranslation is triggered from target child.
         *
         * @method _reflow
         */
        _reflow: function (index) {
            var childSize,
                startingIndex = index || 0,
                childrenLength = this._children.length,
                currentOffset = [0, 0],
                newSize = [0, 0],
                index = + (this._direction === 'y'),
                opposite = + !index,
                child,
                childOrigin;

            for (var i = 0; i < childrenLength; i++) {
                child = this._children[i];
                childSize = this._spacers[child] ? this._spacers[child].get() : child.getSize();
                if (!childSize || childSize.length == 0) continue;
                if (i >= startingIndex) {
                    childOrigin = child.getOrigin();
                    child.setPosition(currentOffset[0] + (childSize[0] * childOrigin[0]), currentOffset[1] + (childSize[1] * childOrigin[1]));
                }
                currentOffset[index] += (childSize[index] + this._padding);
                if (childSize[opposite] > newSize[opposite]) newSize[opposite] = childSize[opposite];
            }
            if(currentOffset[index] > newSize[index]) newSize[index] = currentOffset[index];
            this._setSize(newSize[0], newSize[1]);
            this.emit('stretchBoxResize'); // TODO: emit this event only once after it is certain that all reflowing has stopped.
        },

        /**
         * Get position of a child, by index
         * @method getChildPosition
         */
        getChildPosition: function (i) {
            return this._children[i].getPosition();
        },

        /**
         *  Get all child components.
         *  @method getChildren
         */
        getChildren: function () {
            return this._children;
        },

        /**
         * Private setSize method.
         *
         * @method _setSize
         */
        _setSize: function (x, y, transition, callback) {
            return this._callSuper(UIContainer, 'setSize', x, y, transition, callback);
        },

        /**
         * Public setSize method. Does nothing.
         *
         * @method setSize
         */
        setSize: function () {
            return;
        },

        /**
         * Removes spacer for child.
         *
         * @method _removeSpacer
         */
        _removeSpacer: function (child) {
            this._spacers[child] = void 0;
            this._removeFromAnimating(child);
        },

        /**
         * Pushes child to an array containing the _ids of all elements whose size is currently
         * animating.
         *
         * @method _addToAnimating
         */
        _addToAnimating: function (child) {
            var id;
            var index = this._childHash[child];

            this._animating.push(index);
        },

        /**
         * Removes child from list of children whose size is currently animating.
         *
         * @method _removeFromAnimating
         */
        _removeFromAnimating: function (child) {
            var index = this._childHash[child];
            var position = this._animating.indexOf(index);

            this._animating.splice(position, 1);
        },
    });

    module.exports = UIStretchBox;
});
