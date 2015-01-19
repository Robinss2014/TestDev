define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var RenderNode = require('famous/core/RenderNode');
    var ContainerSurface = require('./FlatContainerSurface');
    var Timer = require('famous/utilities/Timer');
    var TransTransform = require('famous/transitions/TransitionableTransform');
    var Transitionable = require('famous/transitions/Transitionable');
    var SizeAwareView = require('famous-scene/SizeAwareView');
    var GridLayout = require('./GridLayout');
    var Item = require('./Item');
    var YouTubeItem = require('./YouTubeItem');
    var Modal = require('./Modal');
    var AdditionalDetail = require('./AdditionalDetail');
    var BasicItem = require('./BasicItem');
    var YouTubeItem = require('./YouTubeItem');
    var YouTubeModal = require('./YouTubeModal');
    var YouTubeAdditionalDetail = require('./YouTubeAdditionalDetail');
    var YouTubeOverlay = require('./YouTubeOverlay');


    /*
     *  Lightbox widget that displays a set of items in grid layout and
     *  animates the selected item forward in z-space.
     *
     *  @class Lightbox
     */
    function Lightbox() {
        SizeAwareView.apply(this, arguments);

        this._items = [];       // Store of items that displayed in "browsing mode"
        this._scrollPane;       // ContainerSurface used for native scroll to view items
        this._gridLayout;       // Layout class responsible for positioning items in scroll pane
        this._modalCatcher;     // Event catcher / overlay used to navigate out of modal view
        this._modal;            // ModalView that responsible for copying item content & z-animation
        this._additionalDetail; // AdditionalDetail view (e.g., description of the item)

        // Define size-related properties
        this._itemSize = this.options.itemSize;
        this._originalItemSize = this._itemSize.slice();
        this._detailedItemSize = this.options.detailedItemSize;
        this._originalDetailedItemSize = this._detailedItemSize.slice();
        this._additionalDetailSize = this.options.additionalDetailSize ||
        this._getAdditionalDetailSizeEstimate();

        // Define position/layout-related properties.
        this._blockReflow = null; // Flag used to throttle reflow
        this._scrollAmount = {value: 0};
        this._selectedIndex = null;
        this._modalGridPosition = [null, null];
        this._modalFocusedPosition = [null, null];
        this._isModalDisplayed = false;

        this._gridZDepth = this.options.gridZDepth;

        // Initialize Lightbox
        this._scrollPaneId = 'lightbox-scroll-pane-' + Lightbox.COUNT++;
        this._init();
        this._addEvents();
    }

    Lightbox.DEFAULT_OPTIONS = {
        itemData: new Array(50),
        itemConstructor: YouTubeItem,
        overlayConstructor: YouTubeOverlay,
        modalConstructor: YouTubeModal,
        additionalDetailConstructor: YouTubeAdditionalDetail,
        createOverlay: true,

        // Size options
        itemSize: [400, 400],         // Size of item in 'browsing mode'
        detailedItemSize: [600, 600], // Size of item in 'modal mode'
        additionalDetailSize: null,
        additionalDetailPadding: [25, 25],
        parentSize: null,
        modalMaxSize: [1000, 1000],

        // Grid options
        gridTopMargin: 25,
        gridLeftMargin: 25,
        gridRightMargin: 25,
        gridRowGutter: 25,
        gridColumnGutter: 25,

        // Transition options
        gridZDepth: -50000,
        gridPushBackDelay: 0,
        resizeTransition: {duration: 600, curve: 'inOutBack'},

        pushBackTransition: {duration: 1000, curve: 'outBack'},
        pushBackScale: 0.4,
        pushBackOpacityTransition: {duration: 500, curve: 'linear'},
        pushBackItemVariance: 0,

        modalBackgroundOpacity: 0.75,
        modalTransition: {duration: 1000, curve: 'inOutBack'},
        modalReturnTransition: {duration: 1000, curve: 'outBack'},
        modalSizeTransition: {duration: 1000, curve: 'outCirc'},

        additionalDelay: 600,
        additionalInTranslateTrans: {duration: 500, curve: 'inOutBack'},
        additionalInOpacityTrans: {duration: 500, curve: 'linear'},
        additionalOutTranslateTrans: {duration: 500, curve: 'outExpo'},
        additionalOutOpacityTrans: {duration: 500, curve: 'outExpo'}
    };

    Lightbox.prototype = Object.create(SizeAwareView.prototype);
    Lightbox.prototype.constructor = Lightbox;

// Keep track of number of Lightboxes created in the application
// in order to assign a unique ID to each one.
    Lightbox.COUNT = 0;

///////////////////////////////////////////////////////////////////////////////////////////////
// Public Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    Lightbox.prototype.changePallete = function changePallete(index) {
        index = (index === undefined) ? 0 : index;
        var pallete = BasicItem.PALLETES[index];

        var item;
        var colorCounter = 0;
        for (var i = 0; i < this._items.length; i++) {
            item = this._items[i];
            item._thumbSurf.setProperties({
                backgroundColor: pallete[colorCounter++ % pallete.length]
            });
        }
        ;
    }

    Lightbox.prototype.setDetailDelay = function setDetailDelay(value) {
        this._additionalDetail.setDelay(value);
    }

    Lightbox.prototype.adjustPushBackCurve = function adjustPushBackCurve(curve) {
        this.options.pushBackTransition.curve = curve;
    }

    Lightbox.prototype.adjustModalFlipCurve = function adjustModalFlipCurve(curve) {
        this.options.modalTransition.curve = curve;
    }

    Lightbox.prototype.adjustModalSizeCurve = function adjustModalSizeCurve(curve) {
        this.options.modalSizeTransition.curve = curve;
    }

    Lightbox.prototype.adjustAnimationDuration = function adjustAnimationDuration(value) {
        this.options.pushBackTransition.duration = value;
        this.options.modalTransition.duration = value;
        this.options.modalSizeTransition.duration = value;
        this.options.modalReturnTransition.duration = value;
        this.options.resizeTransition.duration = value * 0.6;
    }

    Lightbox.prototype.setGridPushBackDelay = function setGridPushBackDelay(value) {
        this._gridLayout.setPushBackDelay(value);
    }

    Lightbox.prototype.getGridZDepth = function getGridZDepth() {
        return this._gridZDepth;
    }

    Lightbox.prototype.setZGridDepth = function setZGridDepth(value) {
        this._gridZDepth = -value;
    }

    Lightbox.prototype.getColumnGutters = function getColumnGutters() {
        return this._gridLayout.getColumnGutters();
    }

    Lightbox.prototype.adjustColumnGutters = function adjustColumnGutters(value) {
        this._gridLayout.adjustColumnGutters(value);
    }

    Lightbox.prototype.getRowGutters = function getRowGutters() {
        return this._gridLayout.getRowGutters();
    }

    Lightbox.prototype.adjustRowGutters = function adjustRowGutters(value) {
        this._gridLayout.adjustRowGutters(value);
    }

    Lightbox.prototype.adjustTopMargin = function adjustTopMargin(value) {
        this._gridLayout.adjustTopMargin(value);
    }

    Lightbox.prototype.getTopMargin = function getTopMargin(value) {
        return this._gridLayout.getTopMargin();
    }

    Lightbox.prototype.adjustLeftMargin = function adjustLeftMargin(value) {
        this._gridLayout.adjustLeftMargin(value);
    }

    Lightbox.prototype.getLeftMargin = function getLeftMargin(value) {
        return this._gridLayout.getLeftMargin();
    }

    Lightbox.prototype.adjustRightMargin = function adjustRightMargin(value) {
        this._gridLayout.adjustRightMargin(value);
    }

    Lightbox.prototype.getRightMargin = function getRightMargin(value) {
        return this._gridLayout.getRightMargin();
    }

    Lightbox.prototype.opacitateGridLines = function opacitateGridLines(value, transition) {
        this._gridLayout.opacitateGridLines(value, transition);
    }

    Lightbox.prototype.adjustItemScale = function adjustItemScale(value) {
        for (var i = 0; i < this._items.length; i++) {
            this._items[i].setScale([value, value, 1]);
        }

        // Update the item size
        this._itemSize[0] = this._originalItemSize[0] * value;
        this._itemSize[1] = this._originalItemSize[1] * value;

        this._gridLayout.updateItemSize(this._itemSize);
        this._modal.setFrontItemSize(this._itemSize);
        this._throttleReflow();
    }

    Lightbox.prototype.adjustModalScale = function adjustModalScale(value) {
        // Update the detailedItemSize
        this._detailedItemSize[0] = this._originalDetailedItemSize[0] * value;
        this._detailedItemSize[1] = this._originalDetailedItemSize[1] * value;

        // Update additional detail size
        if (!this.options.additionalDetailSize) {
            this._additionalDetailSize = this._getAdditionalDetailSizeEstimate();
        }

        if (this._modal.setBackItemSize) this._modal.setBackItemSize(this._detailedItemSize);

        this._throttleReflow();
    }

    Lightbox.prototype.adjustGridLayoutDelay = function adjustGridLayoutDelay(value) {
        if (value < 0) return;
        this._gridLayout.updateLayoutDelay(Math.floor(value));
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// Protected Methods
///////////////////////////////////////////////////////////////////////////////////////////////

    Lightbox.prototype._init = function _init() {
        this._addScrollPanel();   // ContainerSurface used to display content
        this._createItems();      // Create 'slides'
        if (this.options.createOverlay) this._createOverlay();
        this._createModalEventCatcher();
        this._createAdditionalDetail();
        this._createModal();
        this._createGridLayout(); // Create layout for 'slides'
    }

    Lightbox.prototype._addScrollPanel = function _addScrollPanel() {
        this._scrollPane = new ContainerSurface({
            classes: ['scroll-pane'],
            properties: {
                overflowY: 'scroll',
                '-webkitOverflowScrolling': 'touch',
                backgroundColor: '#313a39'
            },
            attributes: {
                id: this._scrollPaneId
            }
        });

        this._scrollPane.setPerspective(100000);
        this.add(this._scrollPane);

        // Wait till ContainerSurface is added to DOM before adding events
        Timer.after(this._addScrollEvents.bind(this), 2);
    }

    Lightbox.prototype._addScrollEvents = function _addScrollEvents() {
        var scrollDiv = this._getScrollDiv();
        var lightbox = this;
        scrollDiv.onscroll = function (e) {
            lightbox._scrollAmount.value = this.scrollTop;
        }
    }

    Lightbox.prototype._createItems = function _createItems(scrollview) {
        this._items = [];

        var ItemConstructor = this.options.itemConstructor;
        var item;
        var self = this;
        for (var i = 0; i < this.options.itemData.length; i++) {
            item = new ItemConstructor({
                id: i,
                size: this._itemSize.slice(),
                data: this.options.itemData[i]
            });

            item.on('click', self._onGridItemClick.bind(self));
            if (this.options.createOverlay) {
                item.on('mouseover', self._onGridItemMouseover.bind(self));
                item.on('mouseout', self._onGridItemMouseout.bind(self));
            }

            this._items.push(item);
        }
        ;

        return this._items;
    }

    Lightbox.prototype._createOverlay = function _createOverlay() {
        var OverlayConstructor = this.options.overlayConstructor;
        this._overlay = new OverlayConstructor();
        this._scrollPane.add(this._overlay);
    }

    Lightbox.prototype._createGridLayout = function _createGridLayout() {
        this._gridLayout = new GridLayout({
            items: this._items,
            itemSize: this._itemSize.slice(),
            resizeTransition: this.options.resizeTransition,
            scrollOffset: this._scrollAmount,
            topMargin: this.options.gridTopMargin,
            leftMargin: this.options.gridLeftMargin,
            rightMargin: this.options.gridRightMargin,
            rowGutter: this.options.gridRowGutter,
            columnGutter: this.options.gridColumnGutter,
            pushBackDelay: this.options.gridPushBackDelay
        });

        this._gridPositionMod = new Modifier({
            origin: [0, 0],
            align: [0, 0]
        });

        this._scrollPane.add(this._gridPositionMod)
            .add(this._gridLayout);
    }

    Lightbox.prototype._createModalEventCatcher = function _createModalEventCatcher() {
        // Event catcher surface
        this._modalCatcher = new Surface({
            properties: {backgroundColor: 'black'}
        });
        this._modalCatcher.on('click', this._animateModalOut.bind(this));

        // Event catcher modifier
        this._modalCatcherTransTransform = new TransTransform();
        this._modalCatcherTransTransform.setTranslate([0, 0, 1]);

        this._modalCatcherOpacity = new Transitionable(0);

        this._modalCatcherMod = new Modifier({
            transform: this._modalCatcherTransTransform,
            opacity: this._modalCatcherOpacity
        });

        this.add(this._modalCatcherMod).add(this._modalCatcher);
    }

    Lightbox.prototype._createModal = function _createModal() {
        var ModalConstructor = this.options.modalConstructor;

        this._modal = new ModalConstructor({
            frontItemSize: this._itemSize.slice(),
            backItemSize: this._detailedItemSize.slice(),
            maxSize: this.options.modalMaxSize.slice()
        });

        this._modalTransTransform = new TransTransform();
        this._modalBackgroundOpacity = new Transitionable(1);

        this._modalMod = new Modifier({
            transform: this._modalTransTransform,
            opacity: this._modalBackgroundOpacity
        });

        this.add(this._modalMod)
            .add(this._modal);

        this._hideModalNode();
    }

    Lightbox.prototype._createAdditionalDetail = function _createAdditionalDetail() {
        var AdditionalDetailConstructor = this.options.additionalDetailConstructor;
        this._additionalDetail = new AdditionalDetailConstructor({
            size: this._additionalDetailSize.slice()
        });
        this._additionalDetail.on('click', this._animateModalOut.bind(this));

        this._additionalDetailTrans = new TransTransform();
        this._additionalDetailTransOpac = new Transitionable(1);
        this._additionalDetailMod = new Modifier({
            transform: this._additionalDetailTrans,
            opacity: this._additionalDetailTransOpac
        });

        this.add(this._additionalDetailMod).add(this._additionalDetail);
    }

    Lightbox.prototype._hideModalNode = function _hideModalNode() {
        this._modalCatcherTransTransform.setScale([0.001, 0.001, 1]);

        this._modalTransTransform.setScale([0.001, 0.001, 1]);
        this._modalBackgroundOpacity.set(0);

        this._additionalDetailTrans.setScale([0.001, 0.001, 1]);
        this._additionalDetailTransOpac.set(0);
    }

    Lightbox.prototype._unhideModalNode = function _unhideModalNode() {
        this._modalCatcherTransTransform.setScale([1, 1, 1]);

        this._modalTransTransform.setScale([1, 1, 1]);
        this._modalBackgroundOpacity.set(1);

        this._additionalDetailTrans.setScale([1, 1, 1]);
        this._additionalDetailTransOpac.set(1);
    }

    Lightbox.prototype._animateModalIn = function _animateModalIn() {
        var index = this._selectedIndex;
        var self = this;
        this._eventOutput.emit('animateModalIn');

        // Animate overlay
        if (this.options.createOverlay) this._overlay.animateClick();

        // Push back GridLayout
        this._gridLayout.pushBack(this._gridZDepth, 0.5, this.options.pushBackTransition);

        ///////////////////////////////////////////////////////////////////////////////////////////
        // Transition Modal
        ///////////////////////////////////////////////////////////////////////////////////////////

        this._modalTransTransform.halt();
        this._modalCatcherOpacity.halt();

        // Copy item's surface on to the modal
        this._items[index].setOpacity(0);
        var item = this._items[index];
        this._modal.setFrontContent({
            content: item.getSurfaceContent(),
            properties: item.getSurfaceProperties()
        });

        var backfaceData = this.options.itemData[this._selectedIndex] || {};
        if (this._modal.setBackContent) this._modal.setBackContent({
            index: this._selectedIndex,
            content: backfaceData,
            properties: item.getSurfaceProperties()
        });
        this._unhideModalNode();

        // Move modal to corresponding spot in grid
        this._setModalGridPosition(); // sets this._modalGridPosition
        this._modalTransTransform.setTranslate([this._modalGridPosition[0], this._modalGridPosition[1], 10]);

        // Move modal to center of screen
        this._centerModal(this.options.modalTransition);

        // Rotate modal
        this._modal.animateIn(this.options.modalTransition, this.options.modalSizeTransition, this._getRotationDirection());

        // Position & animate in additional detail
        this._positionAdditionalDetail();

        // Fade in event catcher
        this._modalCatcherOpacity.set(this.options.modalBackgroundOpacity, this.options.pushBackOpacityTransition);

        // Update modal display status
        this._isModalDisplayed = true;
    }

    Lightbox.prototype._animateModalOut = function _animateModalOut() {
        this._eventOutput.emit('animateModalOut');

        this._gridLayout.pushBack(0, 1, this.options.pushBackTransition);

        this._modalCatcherOpacity.halt();
        this._modalCatcherOpacity.set(0, this.options.pushBackOpacityTransition);

        var self = this;
        this._setModalGridPosition();
        this._modalTransTransform.setTranslate(this._modalGridPosition, this.options.modalReturnTransition, function () {
            self._items[self._selectedIndex].setOpacity(1, {duration: 10, curve: 'outExpo'}, function () {
                self._hideModalNode();
            });
        });

        this._modal.animateOut(this.options.modalTransition, this.options.modalSizeTransition, this._getRotationDirection());

        self._additionalDetail.animateOut(self.options.additionalOutTranslateTrans, self.options.additionalOutOpacityTrans);

        this._isModalDisplayed = false;
    }

    Lightbox.prototype._addEvents = function _addEvents() {
        var self = this;
        self._eventInput.on('parentResize', self._throttleReflow.bind(self));
    }

    Lightbox.prototype._throttleReflow = function _throttleReflow() {
        if (this._blockReflow) return;

        // Handle edge case of initial resize
        var waitTime;
        var transition;
        var hideGridLines;
        if (this._blockReflow === null) {
            waitTime = 1;
            transition = undefined;
            hideGridLines = true;
        } else {
            waitTime = 750;
            transition = this.options.resizeTransition
            hideGridLines = false;
        }

        this._blockReflow = true;
        var self = this;
        Timer.setTimeout(function () {
            self._blockReflow = false;

            // Resize the grid
            self._gridLayout.updateLayout({
                parentSize: self.getParentSize() || [window.innerWidth, window.innerHeight],
                transition: transition
            });

            if (hideGridLines) {
                self._gridLayout.opacitateGridLines(0);
            }

            // Reposition the modal / additional detail
            if (self._isModalDisplayed) {
                // Update modal grid position
                self._setModalGridPosition();

                self._centerModal({duration: 300, curve: 'outExpo'});
                self._additionalDetailTrans.setTranslate(self._getAdditionalDetailPos(), {
                    duration: 300,
                    curve: 'outExpo'
                });
            }
        }, waitTime);
    }

    Lightbox.prototype._onGridItemClick = function _onGridItemClick(index) {
        this._selectedIndex = index;

        var additionalDetailData = (this.options.itemData[index]) ? this.options.itemData[index] : {};
        this._additionalDetail.updateContent(additionalDetailData);

        this._animateModalIn();
    }

    Lightbox.prototype._onGridItemMouseover = function _onGridItemMouseover(index) {
        this._eventOutput.emit('gridItemMouseover', index);

        var item = this._items[index];
        var content = item.getData();
        var size = item.getSize();
        var pos = this._gridLayout.getItemPosition(index);

        this._overlay.setSize(size);
        this._overlay.setContent(content);
        this._overlay.setPosition(pos);

        this._overlay.display();
    }

    Lightbox.prototype._onGridItemMouseout = function _onGridItemMouseout(index) {
        this._eventOutput.emit('gridItemMouseout', index);
        this._overlay.hide();
    }

    Lightbox.prototype._centerModal = function _centerModal(transition) {
        var size = this.getParentSize();
        this._modalFocusedPosition = [size[0] / 2 - this._detailedItemSize[0] / 2, size[1] / 2 - this._detailedItemSize[1] / 2, 10]
        this._modalTransTransform.setTranslate(this._modalFocusedPosition, transition);
    }

    Lightbox.prototype._setModalGridPosition = function _setModalGridPosition() {
        var pos = this._gridLayout.getItemPosition(this._selectedIndex);
        this._modalGridPosition = [pos[0], pos[1] - this._scrollAmount.value, 0];
    }

    Lightbox.prototype._getAdditionalDetailPos = function _getAdditionalDetailPos(transition) {
        var firstPassPosition = [
            this._modalFocusedPosition[0] + this._detailedItemSize[0] + this.options.additionalDetailPadding[0],
            this._modalFocusedPosition[1] + this.options.additionalDetailPadding[1],
            10
        ];

        // Check to see that additional detail block can fit to the right of video
        var parentSize = this.getParentSize();
        // Position additional detail block to the right of modal
        if (firstPassPosition[0] + this._additionalDetailSize[0] < parentSize[0]) {
            this._additionalDetail.setSize(this._additionalDetailSize);
            return firstPassPosition;
        }
        // Position additional detail block below modal
        else {
            var size = this._detailedItemSize;
            var padding = this.options.additionalDetailPadding;
            var yPos = this._modalFocusedPosition[1] + size[1] + padding[1];
            var height = Math.min(size[1] * 1 / 2, parentSize[1] - yPos - (padding[1] || 10));

            this._additionalDetail.setSize([size[0], height]);
            return [this._modalFocusedPosition[0], yPos, 10];
        }
    }

    Lightbox.prototype._positionAdditionalDetail = function _positionAdditionalDetail() {
        var self = this;

        this._additionalDetailTrans.halt();
        self._additionalDetailTransOpac.halt();

        this._additionalDetailTrans.setTranslate(this._getAdditionalDetailPos());
        this._additionalDetailTransOpac.delay(this.options.additionalDelay, function () {
            self._additionalDetail.animateIn(self.options.additionalInTranslateTrans, self.options.additionalInOpacityTrans);
        });
    }

    Lightbox.prototype._getAdditionalDetailSizeEstimate = function _getAdditionalDetailSizeEstimate() {
        return [
            this._detailedItemSize[0] * 0.8,
            this._detailedItemSize[1] - 2 * this.options.additionalDetailPadding[1]
        ];
    }

    Lightbox.prototype._getRotationDirection = function _getRotationDirection() {
        // Columns start at index of 0
        return (this._gridLayout._data[this._selectedIndex].column / (this._gridLayout._totalColumns - 1)) > 0.5 ? -1 : 1;
    }

    Lightbox.prototype._getScrollDiv = function _getScrollDiv() {
        return document.getElementById(this._scrollPaneId);
    }

    module.exports = Lightbox;
});
