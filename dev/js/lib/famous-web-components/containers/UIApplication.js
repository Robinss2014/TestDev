define(function(require, exports, module) {
    var UIContainer         = require('./UIContainer');
    var Engine              = require('famous/core/Engine');
    var UIBase              = require('../core/UIBase');

    var UIApplication = UIContainer.extend(/** @lends UIContainer.prototype */{
        /**
         * A main container for apps
         *
         * @class UIApplication
         * @uses UIContainer
         * @constructor
         *
         * @param {Object} [options] options to be applied to underlying
         *    UIElement
         */
        constructor:function(options) {
            this._callSuper(UIContainer, 'constructor', options);
            this._createContext();

            Engine.on('resize', this._handleResize.bind(this));
        },

        /*
         *  @method _createContext
         *  @protected
         */
        _createContext: function(el) {
            // Resize event etc. might be useful later on, but are being emitted
            // on Engine
            this._context = Engine.createContext(el);
            this.setPerspective(1000);
            Engine.pipe(this);
            this._context.add(this);
            return this;
        },

        /**
         * Set the current webkit-persepective on the UIApplication.
         * @method setPerspective
         */
        setPerspective: function(perspective, transition, callback) {
            this._context.setPerspective(perspective, transition, callback);
        },

        /**
         * Called on resize.  Sets size on all children with percentage based size.
         * Note that we are currently assuming size to be window size.
         *
         * @method _handleResize
         */
        _handleResize: function() {
            var percentSize;
            var child;
            for (var i = 0; i < this._children.length; i++) {
                child = this._children[i];
                if (child._percentage) {
                    percentSize = child._percentage.get();
                    child.setSize(percentSize[0] * innerWidth, percentSize[1] * innerWidth);
                }
            }
        },

        /**
         * Updates the size of all children with percentage based size.  Calls UIContainer's addChild method.
         *  @method addChild
         */
        addChild: function (child) {
            if (child._percentage) {
                percentSize = child._percentage.get();
                child.setSize(percentSize[0] * innerWidth, percentSize[1] * innerWidth);
            }
            return this._callSuper(UIContainer, 'addChild', child);
        }

        // FIXME See showOff7.
        // /**
        //  *  Return the size of the UIApplication.
        //  *  @method getSize
        //  *  @returns {Array | 2D}
        //  */
        // getSize: function() {
        //     return this._context.getSize();
        // }
    });

    module.exports = UIApplication;
});
