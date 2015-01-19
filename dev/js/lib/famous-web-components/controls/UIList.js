define(function(require, exports, module) {
    var UIContainer         = require('../containers/UIContainer');
    var ContainerSurface    = require('famous/surfaces/ContainerSurface');
    var UIElement           = require('../core/UIElement');
    var UIListRenderer      = require('./UIListRenderer');

    var UIList = UIContainer.extend(/** @lends UIScrollContainer.prototype */{
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

            this._itemHeight          = options.itemHeight || 70;
            this._bufferItems         = options.buffers || 2;
            this._collection          = options.collection;
            this._listItemConstructor = options.listItemConstructor || UIListRenderer;
            this._scrollIndex         = 0;
            this._selectedIndex       = null;
            this._layoutFn            = options.layout;
            this._padding             = options.padding || 20;
            this._labelField          = options.labelField || 'label';
            this._itemTotalHeight     = this._itemHeight + this._padding;

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
            this._collection.on('lengthReady', this._handleLengthReady.bind(this));

            this._rootNode.add(this._container);

            this._renderers = [];
            this._layoutRenderers();

            this._createPhantomElement();

            this.on('selected', this._handleItemClick.bind(this));
        },

        /**
         * Creates list length and lays out renderers on 'lengthReady' event.
         *
         * @method _setClasses
         */
        _handleLengthReady: function(p_evt) {
            this._renderers = [];
            this._layoutRenderers();

            this._createPhantomElement();
            this._handleScrollUpdate();
        },

        /**
         * Sets CSS classes on scrollable container based on user generated options.
         *
         * @method _setClasses
         */
        _setClasses: function () {
            var classes = ['scrollable'];

            if (!this.options.scrollbar) classes.push('disable-scrollbar');
            if (this.options.backfaceVisibility) classes.push('backfaceVisibility');

            return classes;
        },

        /**
         * Called when UIList's collection emits a 'addItem' event.  Adjusts renderers
         * accordingly.
         *
         * @method _handleAddItem
         */
        _handleAddItem: function(added) {
            if(this._getRendererAtItemIndex()){
                var modelIndex = added.index;
                var targetRenderIndex = added.index - this._scrollIndex;
                var renderer;
                for (var i = targetRenderIndex; i < this._renderers.length; i++) {
                    renderer = this._renderers[i];
                    renderer.setModel(this._collection.getItemAt(modelIndex));
                    modelIndex++;
                }
            }
        },

        /**
         * Called when UIList's collection emits a 'removeItem' event.  Adjusts renders
         * accordingly.
         *
         * @method _handleRemoveItem
         */
        _handleRemoveItem: function(removed) {
            if(this._getRendererAtItemIndex()){
                var modelIndex = removed.index;
                var targetRenderIndex = removed.index - this._scrollIndex;
                var renderer;
                for (var i = targetRenderIndex; i < this._renderers.length; i++) {
                    renderer = this._renderers[i];
                    renderer.setModel(this._collection.getItemAt(modelIndex));
                    modelIndex++;
                }
            }
        },

        _handleSetItem: function(p_evt) {
            var renderer = this._getRendererAtItemIndex(p_evt.index);
            if (renderer != null) {
                renderer.setItem(p_evt.item);
            }
        },

        /**
         * See method name.
         *
         * @method setSelectedIndex
         */
        setSelectedIndex: function (index) {
            if(this._selectedIndex === index) return;

            if(this._selectedIndex != null) {
                this._renderers[this._selectedIndex].unselect();
            }

            this._selectedIndex = index;
            if(index > this._scrollIndex - 1 && index < this._scrollIndex + this._renderers.length){
                var targetRenderIndex = index - this._scrollIndex;
                this._renderers[targetRenderIndex].setSelected();
            }
        },

        /**
         * Returns the index of the currently selected item in the collection.
         *
         * @method getSelectedIndex
         */
        setCollection: function(collection) {
            this._collection = collection;
            return collection;
        },

        /**
         * Returns the index of the currently selected item in the collection.
         *
         * @method getSelectedIndex
         */
        getSelectedIndex: function() {
            return this._selectedIndex;
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
            var newIndex = Math.floor(scrollPos / this._itemTotalHeight);
            var scrollProgress = (scrollPos % this._itemTotalHeight) / this._itemTotalHeight;
            var scrollHeight = this.getSize()[1];

            if( newIndex !== this._scrollIndex ) this._handleIndexChange(newIndex);
        },

        /**
         * Called on click of an item.  Sets currently selected index of UIList.
         *
         * @method _handleItemClick
         * @param {Object} [renderer] renderer that has been clicked.
         *
         */
        _handleItemClick: function(renderer) {
            var clickedRendererIndex = this._renderers.indexOf(renderer);
            var itemIndex = this._scrollIndex + clickedRendererIndex;
            var unselectedRenderer;

            if(this._selectedIndex === itemIndex) return;

            if(this._selectedIndex != null) {
                unselectedRenderer = this._getRendererAtItemIndex(this._selectedIndex);
                if(unselectedRenderer) unselectedRenderer.deselect();
            }

            this._selectedIndex = itemIndex;
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
                indexDisplacement = this._scrollIndex - newIndex,
                renderersLength = this._renderers.length,
                newOrder = [],
                replaced,
                rendererIndex,
                swapped,
                prevItemIndex,
                currentItemIndex,
                item;

            for (var i = 0; i < renderersLength; i++) {
                rendererIndex = i + indexDisplacement;

                if(direction === 'up') {
                    if(rendererIndex > renderersLength - 1) {
                        rendererIndex = rendererIndex % renderersLength;
                        swapped = true;
                    }
                }
                else if(direction === 'down') {
                    if(rendererIndex < 0) {
                        rendererIndex = renderersLength - (Math.abs(rendererIndex) % renderersLength);
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
                        newOrder[rendererIndex].setPosition(0, currentItemIndex * (this._padding + this._itemHeight), 0);
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

        /**
         * Initializes the necessary amount of listItemRenders and establishes a beginning
         * layout for renders.
         */
        _layoutRenderers: function() {
            var containerSize = this.getSize(),
                model,
                numRenderers = Math.ceil(containerSize[1] / this._itemTotalHeight) + (this._bufferItems),
                offset = 0,
                listItem;

            for (var i = 0; i < numRenderers; i++) {
                listItem = new this._listItemConstructor({
                    size: [containerSize[0] - 3, this._itemHeight],
                    position: [0, offset],
                    item: this._collection.getItemAt(i)
                });

                listItem.on('selected', this._handleItemClick.bind(this))

                offset += this._itemTotalHeight;
                this._renderers.push(listItem);
                this._container.add(listItem);
            }
        },

        /**
         * Helper function that creates a 'phantom' element with the total size
         * of all items in the list.  This makes the scrollbar an accurate 
         * representation of the list size.
         */
        _createPhantomElement: function() {
            var phantomHeight = this._itemTotalHeight * this._collection.getLength();

            this._phantomElement = new UIElement({
                size: [undefined, phantomHeight],
                style: { pointerEvents: 'none' }
            });

            this._container.add(this._phantomElement);
        },

        /**
         * Helper function that returns either a renderer or undefined
         * if no renderer exists at the input itemIndex.
         */
        _getRendererAtItemIndex: function(itemIndex) {
            var rendererIndex = itemIndex - this._scrollIndex;
            var renderer = this._renderers[rendererIndex];
            return renderer;
        }
    });

    module.exports = UIList;
});
