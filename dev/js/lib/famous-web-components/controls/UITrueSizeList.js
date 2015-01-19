define(function(require, exports, module) {
    var UIList           = require('./UIList');
    var UIListRenderer   = require('./UIListTrueSizeRenderer');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var UIContainer      = require('ui/containers/UIContainer');

    var UIList = UIList.extend(/** @lends UIList.prototype */{
        /**
         * Creates a container surface in which to layout renderers.  Sets up listener
         * for scroll events on container.
         *
         * @class UIList
         * @uses UIList
         * @constructor
         *
         * @param {Object} [options] options to be applied to UIList.
         */
        constructor: function UIList(options) {
            this._callSuper(UIContainer, 'constructor', options);

            // AKA default loading height
            this._itemHeight          = options.loadingHeight || 70;
            this._bufferItems         = options.buffers || 2;
            this._collection          = options.collection;
            this._listItemConstructor = options.listItemConstructor || UIListRenderer;
            this._scrollIndex         = 0;
            this._selectedIndex       = null;
            this._layoutFn            = options.layout;
            this._padding             = options.padding || 20;
            this._labelField          = options.labelField || 'label';
            this._itemTotalHeight     = this._itemHeight + this._padding;
            this._sizeCache           = [];
            this._currentOffset       = 0;

            this._container = new ContainerSurface({
                classes: this._setClasses(),
                size: this.getSize()
            });
            this._container.on('deploy', function(){
                this._scrollableEl = this._container._currentTarget;
                this._scrollableEl.onscroll = this._handleScrollUpdate.bind(this);
                this._handleScrollUpdate();
            }.bind(this));

            this._collection.on('addItem', this._handleAddItem.bind(this));
            this._collection.on('removeItem', this._handleRemoveItem.bind(this));
            this._collection.on('setItem', this._handleSetItem.bind(this));

            this._rootNode.add(this._container);

            this._renderers = [];
            this._initRenderers();

            this.on('selected', this._handleItemClick.bind(this));
        },

        /**
         * Called on scroll events.  Calls a handler function if a new item
         * has been scrolled to.
         *
         * @method _handleScrollUpdate
         *
         */
        _handleScrollUpdate: function() {
            var scrollPos = this._scrollableEl.scrollTop;
            var nextIndexThreshold = this._currentOffset + this._sizeCache[this._scrollIndex] + this._padding;
            var prevIndexThreshold = this._currentOffset;
            var newIndex = this._scrollIndex;

            if ( scrollPos > nextIndexThreshold ) {
                while ( scrollPos > nextIndexThreshold ) {
                    newIndex++;
                    nextIndexThreshold  += this._sizeCache[newIndex] + this._padding;
                    this._currentOffset += this._sizeCache[newIndex - 1] + this._padding;
                }
                this._handleIndexChange( newIndex );
            } else if ( scrollPos < prevIndexThreshold ) {
                while ( scrollPos < prevIndexThreshold ) {
                    newIndex--;
                    prevIndexThreshold  -= this._sizeCache[newIndex] + this._padding;
                    this._currentOffset -= this._sizeCache[newIndex] + this._padding;
                }
                this._handleIndexChange( newIndex );
            }
        },

        /**
         * Called when a new item has been scrolled to.  This is the primary layout
         * function that determines the new position of any renders whose index past
         * the padding zone of the UIList.
         *
         * @method _handleIndexChange
         * @param {Number} [newIndex] index of the newly scrolled-to model in the collection.
         *
         */
        _handleIndexChange: function(newIndex) {
            var direction = newIndex > this._scrollIndex ? 'down' : 'up',
                indexDisplacement = newIndex - this._scrollIndex,
                renderersLength = this._renderers.length,
                newOrder = [],
                replaced,
                rendererIndex,
                swapped,
                prevItemIndex,
                currentItemIndex,
                item,
                targetPosition;

            for (var i = 0; i < renderersLength; i++) {
                rendererIndex = i - indexDisplacement;

                if(direction === 'up') {
                    if(rendererIndex > renderersLength - 1) {
                        rendererIndex = rendererIndex % renderersLength;
                        targetPosition = this._renderers[0].getPosition()[1] - this._padding - this._sizeCache[newIndex];
                        swapped = true;
                    }
                }
                else if(direction === 'down') {
                    if(rendererIndex < 0) {
                        rendererIndex = renderersLength - (Math.abs(rendererIndex) % renderersLength);
                        targetPosition = this._renderers[this._renderers.length - 1].getPosition()[1] + this._padding + this._renderers[this._renderers.length - 1].getSize()[1];
                        swapped = true;
                    }
                }

                newOrder[rendererIndex] = this._renderers[i];
                if(swapped) {
                    prevItemIndex = i + this._scrollIndex;
                    currentItemIndex = newIndex + rendererIndex;
                    item = this._collection.getItemAt(currentItemIndex);

                    if(currentItemIndex < this._collection.getLength()) {
                        newOrder[rendererIndex].setItem(item);
                        newOrder[rendererIndex].setPosition(0, targetPosition, 0);
                    }
                    if(prevItemIndex === this._selectedIndex) {
                        newOrder[rendererIndex].deselect();
                    }
                    else if(currentItemIndex === this._selectedIndex) {
                        newOrder[rendererIndex].setSelected();
                    }
                    newOrder[rendererIndex].animateIn(direction);
                }
                swapped = false;
            }

            this._renderers = newOrder;
            this._scrollIndex = newIndex;
        },

        _initRenderers: function() {
            var containerSize = this.getSize(),
                model,
                numRenderers = Math.ceil(containerSize[1] / this._itemTotalHeight) + (this._bufferItems),
                renderer;

            for (var i = 0; i < numRenderers; i++) {
                renderer = new this._listItemConstructor({
                    size: [containerSize[0] - 3, true],
                    item: this._collection.getItemAt(i)
                });

                renderer.on('selected', this._handleItemClick.bind(this));
                renderer.on('sizeChange', this._layoutRenderers.bind(this, renderer));

                this._renderers.push(renderer);
                this._container.add(renderer);
            }
        },

        /**
         * Initializes the necessary amount of listItemRenders and establishes a beginning
         * layout for renders.
         */
        _layoutRenderers: function(changedRenderer) {
            var startingIndex   = this._renderers.indexOf(changedRenderer);
            var renderersLength = this._renderers.length;
            var offset          = changedRenderer.getPosition()[1];
            var rendererHeight;
            var renderer;

            this._sizeCache[this._getIndexOfRenderer(changedRenderer)] = changedRenderer.getSize()[1];;

            for (var i = startingIndex; i < renderersLength; i++) {
                renderer       = this._renderers[i];
                rendererHeight = this._sizeCache[this._getIndexOfRenderer(renderer)] || 0;
                renderer.setPosition(0, offset, 0);

                offset += rendererHeight + this._padding;
            }
        },

        _getIndexOfRenderer: function (renderer){
            return this._scrollIndex + this._renderers.indexOf(renderer);
        },

        /**
         * Helper function that creates a 'phantom' element with the total size
         * of all items in the list.  This makes the scrollbar an accurate 
         * representation of the list size.
         */
        _createPhantomElement: function() {
            
        }
    });

    module.exports = UIList;
});
