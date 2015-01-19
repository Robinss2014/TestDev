define(function(require, exports, module) {
    var UIContainer         = require('./UIContainer');
    var Engine              = require('famous/core/Engine');
    var UIComponent         = require('ui/core/UIComponent');
    var Transform           = require('famous/core/Transform');
    var UIElement           = require('ui/core/UIElement');

    var UIRow = UIContainer.extend(/** @lends UIContainer.prototype */{
        /**
         * A layout imitating the bootstrap grid layout.
         *
         * @class UI
         * @uses UIContainer
         * @constructor
         *
         * @param {Object} [options] options to be applied to underlying
         *    UIElement
         */
        constructor: function UIRow(options) {
            if(!options) options = {};

            this._columns = options.columns || 12;
            this._gutters = options.gutters || 30;
            this._width = options.width;
            this._stack = [];
            this._animating = false;
            this._addIndex = 0;
            this._rowHeights = [];
            this._childRows = [];
            this._summedHeights = [];

            console.log(this._gutters);

            this._callSuper(UIContainer, 'constructor', options);

            // this._addChild(new UIElement({ style: { border: '3px dotted black', zIndex: 100 }}));
        },

        addChild: function (childObj) {
            var childSize;
            var container;

            if(Array.isArray(childObj.element)) {
                container = new UIRow({
                    children: childObj.element,
                    gutters: this._gutters,
                    columns: this._columns
                });
                this._childRows.push(container);
                //I know, I know...
                container._child = container;
                childSize = container.getSize();
                container.setSize(childSize);
            } else {
                container = new UIComponent();
                container._addChild(childObj.element);
                container._child = childObj.element;
                childSize = childObj.element.getSize();
                container.setSize(childSize);
            }

            this._callSuper(UIContainer, 'addChild', container);
            this._stack.push(buildStackObject(childObj.cols, childObj.offset));
            this._reflow();
        },

        _reflow: function (querySize, transition) {
            var rowWidth = this.getSize()[0],
            colSize = (rowWidth - ((this._columns - 1) * this._gutters)) / this._columns,
            colCount = 0,
            currentRow = 0,
            itemsInRow = 0,
            colBlocks,
            child,
            childHeight;

            this._sizeState.halt();

            for (var i = 0; i < this._children.length; i++) {
                child = this._children[i];
                colBlocks = this._stack[i].cols[querySize];
                colOffset = this._stack[i].offset[querySize];
                if(colCount + colBlocks + colOffset > this._columns) {
                    ++currentRow;
                    colCount = 0;
                    itemsInRow = 0;
                }
                child.halt();
                childHeight = child._child.getSize()[1];
                offsetX = (colCount + colOffset) * colSize + (colCount * this._gutters);
                offsetY = _sumRowHeight.call(this, currentRow);
                if (child instanceof UIRow){
                    // child.setPosition([offsetX, offsetY, 0]);
                    child.setSize([(colSize * colBlocks) + ((colBlocks - 1) * this._gutters), true]);
                } else {
                    child.setSize([(colSize * colBlocks) + ((colBlocks - 1) * this._gutters), true], transition);
                }
                    child.setPosition([offsetX, offsetY, 0], transition);
                if(this._rowHeights[currentRow] < childHeight || this._rowHeights[currentRow] == null) this._rowHeights[currentRow] = childHeight;
                colCount += (colBlocks + colOffset);
                itemsInRow++;
            }

            for (var i = 0; i < this._childRows.length; i++) {
                this._childRows[i]._reflow(querySize, transition);
            }
            this.setSize(rowWidth, _sumRowHeight.call(this, currentRow + 1, true));
            this._rowHeights = [];
        },
    });

    function _sumRowHeight (currentRow, finalRow) {
        var contentHeight = 0;
        var topRow = currentRow;
        while (currentRow) {
            currentRow--;
            contentHeight += this._rowHeights[currentRow];
            if (currentRow + 1 === topRow && finalRow) continue;
            contentHeight += this._gutters;
        }
        return contentHeight;
    }

    function buildStackObject (cols, offset) {
        return {
            cols: {
                lg : cols.lg || cols.md || cols.sm || 12,
                md : cols.md || cols.sm || 12,
                sm : cols.sm || 12,
            },
            offset: {
                lg : (offset.lg != null) ? offset.lg : (offset.md != null) ? offset.md : (offset.sm != null) ? offset.sm : 0,
                md : (offset.md != null) ? offset.md : (offset.sm != null) ? offset.sm : 0,
                sm : offset.sm != null ? offset.sm : 0,
            }
        }
    }

    module.exports = UIRow;
});