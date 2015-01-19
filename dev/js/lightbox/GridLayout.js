define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var Timer = require('famous/utilities/Timer');
    var Utility = require('famous/utilities/Utility');

    var SizeAwareView = require('famous-scene/SizeAwareView');

    /*
     *  Class that is responsible for laying out the items in 'browse mode' into
     *  an evenly spaced grid.
     *  GridLayout also creates surfaces to represent the grid lines between the
     *  items to help visualize how the items are spaced.
     *
     *  @class GridLayout
     */
    function GridLayout() {
        SizeAwareView.apply(this, arguments);

        this._itemSize = this.options.itemSize;
        this._scrollOffset = this.options.scrollOffset;

        // Properties
        this._data = [
            // {id: null, item: null, modifier: null, transformTrans: null, translate: [], row: null, column: null}
        ];

        // Lines used to highlight grid gutters
        this._rowLines = [];
        this._colLines = [];

        this._itemsInRow = null;
        this._startDelayIndex = null; // Index with the smallest animation delay
        this._layoutProperties = {
            columnGutter: this.options.columnGutter,
            rowGutter: this.options.rowGutter,
            topMargin: this.options.topMargin,
            leftMargin: this.options.leftMargin,
            rightMargin: this.options.rightMargin
        };
        this._parentSize = this.options.parentSize;
        this._totalRows = null;
        this._totalHeight = null;
        this._totalWidth = null;
        this._totalColumns = null;
        this._blockUpdateLayout = false;
        this._displayGridLines = false;
        this._leftMarginLine = {};
        this._rightMarginLine = {};

        // Delay (milliseconds) used to stagger animations in updateLayout
        this._totalDelay = this.options.delay;
        this._pushBackDelay = this.options.pushBackDelay;
        this._layoutInitialized = false;

        this._init();
    }

    GridLayout.DEFAULT_OPTIONS = {
        items: [],
        itemSize: [100, 100],
        parentSize: undefined,
        rowGutter: 25,
        columnGutter: 25,
        topMargin: 25,
        leftMargin: 25,
        rightMargin: 25,
        resizeTransition: {duration: 600, curve: 'inOutBack'},
        delay: 1000,
        pushBackDelay: 0
    };

    GridLayout.GUTTER_COLOR = '#31c0ff';
    GridLayout.MARGIN_COLOR = '#31c0ff';

    GridLayout.prototype = Object.create(SizeAwareView.prototype);
    GridLayout.prototype.constructor = GridLayout;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    GridLayout.prototype.setPushBackDelay = function setPushBackDelay(value) {
        this._pushBackDelay = value
    }

    GridLayout.prototype.pushBack = function pushBack(depth, opacity, transition, cb) {
        var currentTranslate;

        // Transition items
        if (cb) cb = Utility.after(this._data.length * 2, cb);
        var delay;
        for (var i = 0; i < this._data.length; i++) {
            delay = this._pushBackDelay * Math.random() * 0.5;

            currentTranslate = this._data[i].transTransform.translate.get();
            this._data[i].transTransform.halt();

            this._data[i].transTransform.translate.delay(delay, function (currentTranslate, i) {
                this._data[i].transTransform.setTranslate(
                    [currentTranslate[0], currentTranslate[1], depth],
                    transition,
                    cb
                );

                this._data[i].opacity.set(opacity, transition, cb);
            }.bind(this, currentTranslate.slice(), i))
        }
        ;

        // Transition lines
        for (var i = 0; i < this._rowLines.length; i++) {
            currentTranslate = this._rowLines[i].trans.translate.get();
            this._rowLines[i].trans.halt();
            this._rowLines[i].trans.setTranslate(
                [currentTranslate[0], currentTranslate[1], depth],
                transition
            );
        }

        for (var i = 0; i < this._colLines.length; i++) {
            currentTranslate = this._colLines[i].trans.translate.get();
            this._colLines[i].trans.halt();
            this._colLines[i].trans.setTranslate(
                [currentTranslate[0], currentTranslate[1], depth],
                transition
            );
        }

        // Left / Right Margin
        currentTranslate = this._leftMarginLine.trans.translate.get();
        this._leftMarginLine.trans.halt();
        this._leftMarginLine.trans.setTranslate(
            [currentTranslate[0], currentTranslate[1], depth],
            transition
        );

        currentTranslate = this._rightMarginLine.trans.translate.get();
        this._rightMarginLine.trans.halt();
        this._rightMarginLine.trans.setTranslate(
            [currentTranslate[0], currentTranslate[1], depth],
            transition
        );
    }

    GridLayout.prototype.getItemPosition = function getItemPosition(index) {
        return this._data[index].translate.slice();
    }

    GridLayout.prototype.getColumnGutters = function getColumnGutters() {
        return this._layoutProperties.columnGutter;
    }

    GridLayout.prototype.adjustColumnGutters = function adjustColumnGutters(value) {
        this._layoutProperties.columnGutter = value;
        this._calculateGridPositions();

        // Throttle layout update to properly animate changes in number of columns
        this._throttleUpdateLayout();
    }

    GridLayout.prototype.getRowGutters = function getColumnGutters() {
        return this._layoutProperties.rowGutter;
    }

    GridLayout.prototype.adjustRowGutters = function adjustRowGutters(value) {
        this._layoutProperties.rowGutter = value;
        this.updateLayout({setDelay: false});
    }

    GridLayout.prototype.adjustTopMargin = function adjustTopMargin(value) {
        this._layoutProperties.topMargin = value;
        this.updateLayout({setDelay: false});
    }

    GridLayout.prototype.getTopMargin = function getTopMargin(value) {
        return this._layoutProperties.topMargin;
    }

    GridLayout.prototype.adjustLeftMargin = function adjustLeftMargin(value) {
        this._layoutProperties.leftMargin = value;
        this._updateMarginLines();

        // Throttle layout update to properly animate changes in number of columns
        this._throttleUpdateLayout();
    }

    GridLayout.prototype.getLeftMargin = function getLeftMargin(value) {
        return this._layoutProperties.leftMargin;
    }

    GridLayout.prototype.adjustRightMargin = function adjustRightMargin(value) {
        this._layoutProperties.rightMargin = value;
        this._updateMarginLines();

        // Throttle layout update to properly animate changes in number of columns
        this._throttleUpdateLayout();
    }

    GridLayout.prototype.getRightMargin = function getRightMargin(value) {
        return this._layoutProperties.rightMargin;
    }

    GridLayout.prototype.updateLayout = function updateLayout(options) {
        if (this._blockUpdateLayout) return;
        options = options || {};
        if (options.parentSize) this._parentSize = options.parentSize;

        this._startDelayIndex = this.getRowFromOffset(this._scrollOffset.value) * this._itemsInRow;
        this._calculateGridPositions();
        this._setTransforms(options.transition, options.setDelay);
    }

    GridLayout.prototype.updateItemSize = function updateItemSize(size) {
        this._itemSize = size;
    }

    GridLayout.prototype.staggerZAnimation = function staggerZAnimation(depth, transition) {
        var transition = transition || {duration: 1000};
        var transitionLength = transition.duration || transition.period;

        var itemTransition;
        for (var i = 0; i < this._data.length; i++) {
            item = this._data[i];
            currentTranslate = item.transTransform._finalTranslate;
            itemTransitionLength = transitionLength * (0.5 + Math.random() * 0.75);

            item.transTransform.halt();

            item.transTransform.setTranslate(
                [currentTranslate[0], currentTranslate[1], -depth],
                {duration: itemTransitionLength * 0.25, curve: 'outExpo'},
                function (item, currentTranslate, itemTransition) {
                    item.transTransform.setTranslate(
                        [currentTranslate[0], currentTranslate[1], 0],
                        {duration: itemTransitionLength * 0.75, curve: 'outBack'}
                    );
                }.bind(this, item, currentTranslate, itemTransition));
        }
    }

    GridLayout.prototype.opacitateGridLines = function opacitateGridLines(value, transition) {
        this._displayGridLines = value > 0;

        for (var i = 0; i < this._rowLines.length; i++) {
            this._rowLines[i].opacity.halt();
            this._rowLines[i].opacity.set(value, transition);
        }

        for (var i = 0; i < this._colLines.length; i++) {
            this._colLines[i].opacity.halt();
            this._colLines[i].opacity.set(value, transition);
        }

        this._leftMarginLine.opacity.halt();
        this._rightMarginLine.opacity.halt();
        this._leftMarginLine.opacity.set(value, transition);
        this._rightMarginLine.opacity.set(value, transition);
    }

    GridLayout.prototype.updateLayoutDelay = function updateLayoutDelay(value) {
        this._totalDelay = value;
    }

    GridLayout.prototype.getHeight = function getHeight() {
        return this._totalHeight;
    }

    GridLayout.prototype.getWidth = function getWidth() {
        return this._totalWidth;
    }

    GridLayout.prototype.getRowFromOffset = function getRowFromOffset(topOffset) {
        var row = 0;
        var rowBottom = this._layoutProperties.topMargin + this._itemSize[1];

        while (topOffset > rowBottom) {
            row++;
            rowBottom += this._itemSize[1] + this._layoutProperties.rowGutter;
        }
        return row;
    }

    GridLayout.prototype.getItemsPerRow = function getItemsPerRow() {
        return this._itemsInRow;
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    GridLayout.prototype._init = function _init() {
        this._setData();
        this._addItems();
        this._addVerticalMargins();
        this._addBottomPlaceholder();
    }

    GridLayout.prototype._setData = function _setData() {
        var obj;
        for (var i = 0; i < this.options.items.length; i++) {
            obj = {};
            obj.id = i;
            obj.item = this.options.items[i];

            obj.transTransform = new TransTransform()
            obj.opacity = new Transitionable(0);
            obj.translate = [];

            obj.modifier = new Modifier({
                transform: obj.transTransform,
                opacity: obj.opacity
            });

            this._data.push(obj);
        }
    }

    GridLayout.prototype._addItems = function _addItems() {
        for (var i = 0; i < this._data.length; i++) {
            this.add(this._data[i].modifier).add(this._data[i].item);
        }
    }

    GridLayout.prototype._addVerticalMargins = function _addVerticalMargins() {
        this._leftMarginLine = this._createLine('leftMarginLine', GridLayout.MARGIN_COLOR, ['grid-column', 'grid-leftMargin']);
        this._rightMarginLine = this._createLine('rightMarginLine', GridLayout.MARGIN_COLOR, ['grid-column', 'grid-rightMargin']);
    }

    GridLayout.prototype._addBottomPlaceholder = function _addBottomPlaceholder() {
        var surf = new Surface({
            opacity: 0,
            size: [1, 1]
        });

        this._placeholderTranslate = new Transitionable([0, 0])

        var translate;
        this._placeholderMod = new Modifier({
            transform: function () {
                translate = this._placeholderTranslate.get();
                return Transform.translate(translate[0], translate[1], 0);
            }.bind(this)
        });

        this.add(this._placeholderMod).add(surf);
    }

    GridLayout.prototype._createLine = function _createLine(id, color, classes) {
        var obj = {};
        obj.id = id;

        classes = classes || [];

        obj.surf = new Surface({
            properties: {backgroundColor: color},
            classes: classes
        });

        obj.trans = new TransTransform();
        obj.opacity = new Transitionable(0);
        obj.mod = new Modifier({
            transform: obj.trans,
            opacity: obj.opacity
        });

        this.add(obj.mod).add(obj.surf);
        return obj;
    }

    GridLayout.prototype._throttleUpdateLayout = function _throttleUpdateLayout() {
        if (this._blockUpdateLayout) return;
        this._blockUpdateLayout = true;

        var self = this;
        var delay = this.options.resizeTransition.duration ||
            this.options.resizeTransition.duration ||
            500;

        Timer.setTimeout(function () {
            self._blockUpdateLayout = false;
            self.updateLayout({transition: self.options.resizeTransition});
        }, delay)
    }

    GridLayout.prototype._calculateGridPositions = function _calculateGridPositions() {
        var verticalOffset = this._layoutProperties.topMargin;
        var horizontalOffset = this._layoutProperties.leftMargin;
        var parentWidth = this._parentSize[0];
        var remainingWidthInRow = parentWidth - horizontalOffset - this._layoutProperties.rightMargin;
        var itemSize = this._itemSize;
        var centeringOffset = 0; // Offset used to center the row
        var rowCount = 0;
        var row = [];
        var rowIndex = 0;
        var rowPositions = [];
        var column = 0;
        var colIndex = 0;
        var colPositions = [];
        var wasUpdateFirstRowCalled = false;

        // Helper function to offset items in first row.
        // Needed b/c centeringOffset isn't known till first row is layed out.
        var updateFirstRowOffset = function updateFirstRowOffset() {
            centeringOffset = (remainingWidthInRow + this._layoutProperties.columnGutter) / 2;

            this._totalColumns = 0;
            for (var i = 0; i < row.length; i++) {
                // Record positions of column grid lines
                colPositions[colIndex++] = row[i].translate[0] + centeringOffset;
                colPositions[colIndex++] = row[i].translate[0] + centeringOffset + itemSize[0];

                row[i].translate = [
                    row[i].translate[0] + centeringOffset,
                    row[i].translate[1]
                ];

                this._totalColumns++;
            }

            wasUpdateFirstRowCalled = true;

            this._totalWidth = row[i - 1].translate[0] + centeringOffset + itemSize[0] - this._layoutProperties.leftMargin;
            this._itemsInRow = i;
        }

        column = 0;
        for (var i = 0; i < this.options.items.length; i++) {
            // Create two rows for each item row (top & bottom)
            if (rowPositions[rowCount * 2] === undefined) {
                rowPositions[rowIndex++] = verticalOffset;
                rowPositions[rowIndex++] = verticalOffset + itemSize[1];
            }

            this._data[i].translate = [horizontalOffset + centeringOffset, verticalOffset];
            this._data[i].row = rowCount;
            this._data[i].column = column++;
            row.push(this._data[i]);

            horizontalOffset += itemSize[0] + this._layoutProperties.columnGutter;
            remainingWidthInRow -= itemSize[0] + this._layoutProperties.columnGutter;

            // Check if new row needs to be created
            if (remainingWidthInRow < itemSize[0] && i !== (this.options.items.length - 1)) {
                if (rowCount === 0) updateFirstRowOffset.call(this);

                // Reset variables to reflect new row
                horizontalOffset = this._layoutProperties.leftMargin;
                remainingWidthInRow = parentWidth - horizontalOffset - this._layoutProperties.rightMargin;
                verticalOffset += itemSize[1] + this._layoutProperties.rowGutter
                row = [];
                rowCount++;
                column = 0;
            }
        }

        if (!wasUpdateFirstRowCalled) updateFirstRowOffset.call(this);

        this._totalRows = rowCount;
        this._totalHeight = verticalOffset + itemSize[1] - this._layoutProperties.topMargin;

        this._updateRows(rowPositions);
        this._updateCols(colPositions, this.options.resizeTransition);
    }

    GridLayout.prototype._setTransforms = function _setTransforms(transition, setDelay) {
        // Instantly position items on first layout to avoid FOUC
        // or if setDelay is explicitly set to false
        if (!this._layoutInitialized || setDelay === false) {
            this._layoutInitialized = true;

            for (var i = 0; i < this._data.length; i++) {
                item = this._data[i];
                item.opacity.set(1);
                item.transTransform.setTranslate(item.translate);
            }
            return;
        }

        // Otherwise, stagger the animation based on total delay paramater
        var item;
        var translate;
        var delay = 0;
        var delayStep = this._totalDelay / Math.min(this._data.length, 20);

        // Helper func to set transforms on an item
        var item;
        var self = this;
        var setTransform = function (index) {
            item = self._data[index];
            item.opacity.set(1);

            item.transTransform.halt();
            item.transTransform.translate.delay(delay, function (item) {
                item.transTransform.setTranslate(item.translate, transition);
            }.bind(null, item));
        }

        // Cycle through items by snaking in both directions from index
        var length = this._data.length;
        var up = this._startDelayIndex;
        var down = up - 1;
        if (down < 0) down = length - 1;

        while (up !== down) {
            setTransform(up);
            setTransform(down);

            up++;
            if (up >= length) up = 0;
            if (up === down) break;

            down--;
            if (down < 0) down = length - 1;

            if (delay < this._totalDelay) delay += delayStep;
        }
        if (up === down && length % 2 === 1) {
            setTransform(up);
        }
    }

    GridLayout.prototype._updateRows = function _updateRows(rowPositions) {
        for (var i = 0; i < rowPositions.length; i++) {
            if (!this._rowLines[i]) this._rowLines[i] = this._createLine(i, GridLayout.GUTTER_COLOR, ['grid-row']);
            if (this._displayGridLines) this._rowLines[i].opacity.set(1);

            this._rowLines[i].mod.setSize([this._totalWidth, 2]);
            this._rowLines[i].trans.halt();
            this._rowLines[i].trans.setScale([1, 1]);
            this._rowLines[i].trans.setTranslate([this._layoutProperties.leftMargin, rowPositions[i], 0]);

            if (i === 0) {
                this._rowLines[i].surf.setProperties({backgroundColor: GridLayout.MARGIN_COLOR})
                this._rowLines[i].mod.setSize([this._totalWidth, 4]);
            }
        }
        ;

        // Add padding to bottom of the scroll view
        this._placeholderTranslate.set([0, rowPositions[rowPositions.length - 1] + this._itemSize[1] * 0.75]);

        // Hide any remaining rows
        if (this._rowLines[i] !== undefined) {
            for (var j = i; j < this._rowLines.length; j++) {
                this._rowLines[j].trans.setTranslate([0, 0, 0]);
                this._rowLines[j].trans.setScale([0.001, 0.001]);
                this._rowLines[j].opacity.set(0);
            }
            ;
        }
    }

    GridLayout.prototype._updateCols = function _updateCols(colPositions, transition) {
        var duration = (transition && transition.duration) ? transition.duration : 400;

        for (var i = 0; i < colPositions.length; i++) {
            if (!this._colLines[i]) this._colLines[i] = this._createLine(i, GridLayout.GUTTER_COLOR, ['grid-column']);
            if (this._displayGridLines) this._colLines[i].opacity.set(1);

            this._colLines[i].mod.setSize([2, this._totalHeight])
            this._colLines[i].trans.halt();
            this._colLines[i].trans.setScale([1, 1]);
            this._colLines[i].trans.setTranslate([colPositions[i], this._layoutProperties.topMargin, 0], {
                duration: duration,
                curve: 'outBounce'
            });
        }
        ;

        // Hide any remaining rows
        if (this._colLines[i] !== undefined) {
            for (var j = i; j < this._colLines.length; j++) {
                this._colLines[j].trans.setTranslate([0, 0, 0]);
                this._colLines[j].trans.setScale([0.001, 0.001]);
                this._colLines[j].opacity.set(0);
            }
            ;
        }

        this._updateMarginLines();
    }

    GridLayout.prototype._updateMarginLines = function _updateMarginLines(colPositions, transition) {
        // Left margin line
        this._leftMarginLine.mod.setSize([4, this._totalHeight]);
        this._leftMarginLine.trans.setTranslate([this._layoutProperties.leftMargin, this._layoutProperties.topMargin, 0], transition);

        // Right margin line
        this._rightMarginLine.mod.setSize([4, this._totalHeight]);
        this._rightMarginLine.trans.setTranslate(
            [this._parentSize[0] - this._layoutProperties.rightMargin, this._layoutProperties.topMargin, 0],
            transition
        );

        if (this._displayGridLines) {
            this._leftMarginLine.opacity.set(1);
            this._rightMarginLine.opacity.set(1);
        }
    }


    module.exports = GridLayout;
});
