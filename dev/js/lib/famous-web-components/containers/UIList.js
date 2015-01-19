define(function(require, exports, module) {
    var UIContainer         = require('./UIContainer');
    var UIStretchBox        = require('../containers/UIStretchBox');
    var Transform           = require('famous/core/Transform');
    var UIElement           = require('../core/UIElement');
    var ContainerSurface    = require('famous/surfaces/ContainerSurface');
    var UIContainer         = require('../containers/UIContainer');
    var Engine              = require('famous/core/Engine');
    var Transitionable      = require('famous/transitions/Transitionable');
    var UIStretchBox        = require('../containers/UIStretchBox');

    // NOTE: This class in its current state will only 
    // work with appMode disabled like so:
    //
    // Engine.setOptions({
    //     appMode: false
    // });

    var UIList = UIContainer.extend(/** @lends UIStretchbox.prototype */{
        /**
         * A UIStretchbox with a container surface and scrolling capabilities.
         * Manages and manipulates an underlying DOM element to provide native
         * scrolling.
         *
         * @class UIList
         * @uses UIStretchbox
         * @constructor
         *
         * @param {Object} [options] options to be applied to container surface.
         */
        constructor: function UIList(options) {
            options = options || {};

            this._animating = 0;
            this._scrollable = options.scrollable || true;
            this._scrollbar = options.scrollbar || false;
            this._direction = options.direction || 'y';
            this._directionInt = + (this._direction === 'y');
            this._updateFrom = options.update || null;

            this._scrollX = new Transitionable(0);
            this._scrollY = new Transitionable(0);

            this._classes = _setClasses(options);
            this._container = new ContainerSurface({
                classes: this._classes,
                size: options.size
            });
            this._container.context.setPerspective(1400);

            this._stretchBox = new UIStretchBox({
                direction: this._direction
            });

            this._scrollableEl;
            this._container.on('deploy', function () {
                this._scrollableEl = this._container._currentTarget;
            }.bind(this));

            this._callSuper(UIContainer, 'constructor', options);

            this._rootNode.add(this._container);
            this._container.add(this._stretchBox);

        },

        /**
         * Before rendering, UIList updates scroll position if necessary.
         *
         * @method render
         */
        render: function () {
            if (this._animating) this._updateScrollPos();
            if (this._updateFrom) this._updateChildren();
            if (this._scrollableEl) this._updatePerspective();

            return this._callSuper(UIContainer, 'render');
        },

        /**
         * Called on render.  Updates scrollTop and scrollLeft properties of DOM element
         * with scrollX and scrollY transitionable values.
         *
         * @method _updateScrollPos
         */
        _updateScrollPos: function () {
            if (!this._scrollableEl) return;

            var updatedX = this._scrollX.get();
            var updatedY = this._scrollY.get();

            if(this._scrollableEl.scrollLeft !== updatedX) {
                this._scrollableEl.scrollLeft = updatedX;
            }
            if (this._scrollableEl.scrollTop !== updatedY){
                this._scrollableEl.scrollTop = updatedY;
            }
        },

        /**
         * Called on render.  Updates scrollTop and scrollLeft properties of DOM element
         * with scrollX and scrollY transitionable values.
         *
         * @method _updateScrollPos
         */
        _updatePerspective: function () {
            var perspective;
            if (this._direction === 'y'){
                perspective = (this._scrollableEl.scrollTop / this.getSize()[1]) * 100;
                this._container._container.style.webkitPerspectiveOriginY = perspective + "%";
            } else {
                perspective = (this._scrollableEl.scrollLeft / this.getSize()[0]) * 100;
                this._container._container.style.webkitPerspectiveOriginX = perspective + "%";
            }
        },

        /**
         * Called on render.  Updates scrollTop and scrollLeft properties of DOM element
         * with scrollX and scrollY transitionable values.
         *
         * @method _updateScrollPos
         */
        _updateChildren: function () {
            if (!this._scrollableEl) return;

            var progress;
            var child;
            var scrollOffset = this._direction === 'y' ? this._scrollableEl.scrollTop : this._scrollableEl.scrollLeft;
            var index = + (this._direction === 'y');
            var childrenLength = this._stretchBox._children.length;
            for (var i = 0; i < childrenLength; i++) {
                child = this._stretchBox._children[i];
                childOffset = this._stretchBox._children[i].getPosition()[index];
                progress = scrollOffset + childOffset;
                this._updateFrom(child, progress);
            }
        },

        updateFrom: function (fn) {
            if (!fn) return;
            else this._updateFrom = fn;
        },

        /**
         * Overrides UIContainer's add child and instead adds children to the
         * render node of the UIContainer.
         *
         * @method _addChild
         * @param {Object} [child] child to be added to UIList's container surface.
         */
        addChild: function (child) {
            return this._stretchBox.addChild(child);
        },

        /**
         * Overrides UIContainer's add child and instead adds children to the
         * render node of the UIContainer.
         *
         * @method _addChild
         * @param {Object} [child] child to be added to UIList's container surface.
         */
        _addChild: function (child) {
            return this._stretchBox._addChild(child);
        },

        /**
         * Sets the vertical scroll position of the UIList.
         *
         * @method setVScrollPosition
         * @param {Object} [options] new y value and optional transition and callback for animation
         */
        setVScrollPosition: function(y, transition, callback) {
            if (!this._animating) this._animating++;

            var wrapped = _wrapCallback.call(this, callback);

            this._scrollY.set(y, transition, wrapped);
        },

        /**
         * Returns the current Y scroll progress of the UIScrollContaienr
         *
         * @method getVScrollPosition
         */
        getVScrollPosition: function () {
            return this._scrollY.get();
        },

        /**
         * Sets the horizontal scroll position of the UIList.
         *
         * @method setHScrollPosition
         * @param {Object} [options] new x value and optional transition and callback for animation
         */
        setHScrollPosition: function(x, transition, callback) {
            if (!this._animating) this._animating++;

            var wrapped = _wrapCallback.call(this, callback);

            this._scrollX.set(x, transition, wrapped);
        },

        /**
         * Returns the current Y scroll progress of the UIList
         *
         * @method getVScrollPosition
         */
        getHScrollPosition: function () {
            return this._scrollX.get();
        },

        /**
         * Returns max vertical scroll distance of the UIList
         *
         * @method getMaxVScrollPosition
         */
        //TODO: find a solution to the DOM loading issue.
        getMaxVScrollPosition: function () {
            if (!this._scrollableEl) return console.log('Container is not yet loaded.');

            return this._scrollableEl.scrollTop - this.getSize()[1]; 
        },

        /**
         * Returns max horizontal scroll distance of the UIList
         *
         * @method getMaxHScrollPosition
         */
        getMaxHScrollPosition: function () {
            if (!this._scrollableEl) return console.log('Container is not yet loaded.');

            return this._scrollableEl.scrollLeft - this.getSize()[0];        
        },
    });

    function _wrapCallback (callback) {
        return function () {
            if (callback) callback();
            this._animating--;
        }.bind(this);
    }

    function _setClasses (options) {
        var classes = ['scrollable'];

        if (options.scrollable) classes.push('scrollable');
        if (!options.scrollbar) classes.push('disable-scrollbar');
        if (options.backfaceVisibility) classes.push('backfaceVisibility');

        return classes;
    }

    module.exports = UIList;
});
