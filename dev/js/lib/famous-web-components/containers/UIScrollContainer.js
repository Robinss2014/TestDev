define(function(require, exports, module) {
    var UIContainer         = require('./UIContainer');
    var UIStretchBox        = require('./UIStretchBox');
    var UIContainer         = require('./UIContainer');
    var UIElement           = require('../core/UIElement');
    var UIElement           = require('../core/UIElement');
    var Engine              = require('famous/core/Engine');
    var Transitionable      = require('famous/transitions/Transitionable');
    var ContainerSurface    = require('famous/surfaces/ContainerSurface');
    var Transform           = require('famous/core/Transform');

    // NOTE: This class in its current state will only 
    // work with appMode disabled like so:
    //
    // Engine.setOptions({
    //     appMode: false
    // });

    var UIScrollContainer = UIContainer.extend(/** @lends UIStretchbox.prototype */{
        /**
         * A UIStretchbox with a container surface and scrolling capabilities.  
         * Manages and manipulates an underlying DOM element to provide native
         * scrolling.
         *
         * @class UIScrollContainer
         * @uses UIStretchbox
         * @constructor
         *
         * @param {Object} [options] options to be applied to container surface.
         */
        constructor: function UIScrollContainer(options) {
            this._callSuper(UIContainer, 'constructor', options);
            options = options || {};

            this._animating = 0;
            this._scrollable = options.scrollable || true;
            this._scrollbar = options.scrollbar || false;

            this._scrollX = new Transitionable(0);
            this._scrollY = new Transitionable(0);

            this._classes = _setClasses(options);

            this._container = new ContainerSurface({
                classes: this._classes,
                size: this.getSize()
            });

            this._scrollableEl;
            this._container.on('deploy', function () {
                this._scrollableEl = this._container._currentTarget;
            }.bind(this));

            this._rootNode.add(this._container);
        },

        /**
         * Before rendering, UIScrollContainer updates scroll position if necessary.
         *
         * @method render
         */
        // render: function () {
        //     if(this._animating) this._updateScrollPos();

        //     return this._callSuper(UIContainer, 'render');
        // },

        /**
         * Called on render.  Updates scrollTop and scrollLeft properties of DOM element
         * with scrollX and scrollY transitionable values.
         *
         * @method _updateScrollPos
         */
        _updateScrollPos: function () {
            if(!this._scrollableEl) return;

            var updatedX = this._scrollX.get();
            var updatedY = this._scrollY.get();

            if(this._scrollableEl.scrollLeft !== updatedX) {
                this._scrollableEl.scrollLeft = updatedX;
            }
            if(this._scrollableEl.scrollTop !== updatedY){
                this._scrollableEl.scrollTop = updatedY;
            }

        },

        /**
         * Overrides UIContainer's add child and instead adds children to the 
         * render node of the UIContainer.
         *
         * @method _addChild
         * @param {Object} [child] child to be added to UIScrollContainer's container surface.
         */
        _addChild: function (child) {
            return this._container.add(child);
        },

        /**
         * Sets the vertical scroll position of the UIScrollContainer.
         *
         * @method setVScrollPosition
         * @param {Object} [options] new y value and optional transition and callback for animation
         */
        setVScrollPosition: function(y, transition, callback) {
            if(!this._animating) this._animating++;

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
         * Sets the horizontal scroll position of the UIScrollContainer.
         *
         * @method setHScrollPosition
         * @param {Object} [options] new x value and optional transition and callback for animation
         */
        setHScrollPosition: function(x, transition, callback) {
            if(!this._animating) this._animating++;

            var wrapped = _wrapCallback.call(this, callback);

            this._scrollX.set(x, transition, wrapped);
        },

        /**
         * Returns the current Y scroll progress of the UIScrollContainer
         *
         * @method getVScrollPosition
         */
        getHScrollPosition: function () {
            return this._scrollX.get();    
        },

        /**
         * Returns max vertical scroll distance of the UIScrollContainer
         *
         * @method getMaxVScrollPosition
         */
        //TODO: find a solution to the DOM loading issue.
        getMaxVScrollPosition: function () {
            if(!this._scrollableEl) return console.log('Container is not yet loaded.');

            return this._scrollableEl.scrollTop - this.getSize()[1]; 
        },

        /**
         * Returns max horizontal scroll distance of the UIScrollContainer
         *
         * @method getMaxHScrollPosition
         */
        getMaxHScrollPosition: function () {
            if(!this._scrollableEl) return console.log('Container is not yet loaded.');

            return this._scrollableEl.scrollLeft - this.getSize()[0];        
        },
        /**
         *  Set the current size of the scroll container
         *  @method setSize
         *  @param {Array.2D} Size in pixels.
         */
        // setSize: function (size) {
        //     // if(this._container) this._container.setSize(size);
        //     return this._callSuper(UIContainer, 'setSize', size);
        // }
    });
    
    function _wrapCallback (callback) {
        return function () {
            if(callback) callback();
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

    module.exports = UIScrollContainer;
});