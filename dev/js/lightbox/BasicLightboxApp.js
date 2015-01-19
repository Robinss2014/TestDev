define(function(require, exports, module) {

    var SizeAwareView         = require('famous-scene/SizeAwareView');
    var Modifier              = require('famous/core/Modifier');
    var Transform             = require('famous/core/Transform');
    var Timer                 = require('famous/utilities/Timer');
    var DeviceHelpers         = require('./DeviceHelpers');
    var Transitionable        = require('famous/transitions/Transitionable');
    var Timer                 = require('famous/utilities/Timer');

    var Lightbox              = require('./Lightbox');
    var BasicModal            = require('./BasicModal');
    var BasicModal2D          = require('./BasicModal2D');
    var BasicItem             = require('./BasicItem');
    var BasicAdditionalDetail = require('./BasicAdditionalDetail');
    var BasicData             = require('./BasicData');

    // Sliders / Checkbox
    var UIBase       = require('famous-web-components/core/UIBase');
    var PanelUI      = require('november-demos-global/PanelUI');
    var UITextSlider = require('famous-web-components/controls/UITextSlider');
    var UILabel      = require('famous-web-components/controls/UILabel');
    var UITooltip    = require('famous-web-components/controls/UITooltip');
    var UICheckBox   = require('famous-web-components/controls/UICheckBox');
    var UIDropdown   = require('famous-web-components/controls/UIDropdown');
    var UIButton     = require('famous-web-components/controls/UIButton');

    /*
     *  BasicLightboxApp...
     *
     *  @class BasicLightboxApp
     */

    function BasicLightboxApp (options) {
        SizeAwareView.apply(this, arguments);
        this.options = options;

        document.body.style.backgroundColor = '#313a39';

        // Add panel after Lightbox has been created.
        this._addLightbox(this._addPanel.bind(this));
    }

    BasicLightboxApp.prototype = Object.create( SizeAwareView.prototype );
    BasicLightboxApp.prototype.constructor = BasicLightboxApp;

    BasicLightboxApp.prototype._addLightbox = function _addLightbox (cb) {
        var self = this;

        // Wait 2 ticks so that the parent size is defined
        Timer.after(function(){
            // adjust settings
            self.options = {};
            self.options.itemData                    = BasicData;
            self.options.itemConstructor             = BasicItem;
            self.options.modalConstructor            = BasicModal;
            self.options.additionalDetailConstructor = BasicAdditionalDetail;

            var parentSize           = self.getParentSize();

            // initial gutter / margins
            self.options.gridTopMargin    = 55;
            self.options.gridLeftMargin   = 45;
            self.options.gridRightMargin  = 45;
            self.options.gridRowGutter    = Math.min(50, parentSize[0] * 0.05);;
            self.options.gridColumnGutter = Math.min(50, parentSize[0] * 0.05);
            self.options.gridPushBackDelay = 0;

            // set the size of the items
            var minLength            = Math.min(parentSize[0], parentSize[1]);
            var itemSize = (parentSize[0] - self.options.gridRightMargin - self.options.gridLeftMargin - 5 * self.options.gridColumnGutter - 1) / 6;
            if (itemSize < 50) {
                itemSize = (parentSize[0] - self.options.gridRightMargin - self.options.gridLeftMargin - 3 * self.options.gridColumnGutter - 1) / 4;
            }

            self.options.itemSize         = [itemSize, itemSize];
            self.options.detailedItemSize = [minLength * 0.4, minLength * 0.7];



            // On Safari, use basic modal to avoid currently unresolved z-clipping issue
            // due to DOM nesting as a result of using a native scroll inside of a ContainerSurface.
            if ( (navigator.userAgent.toLowerCase().indexOf('safari') > 1) &&
                !(navigator.userAgent.toLowerCase().indexOf('chrome') > 1)) {
                self.options.modalConstructor = BasicModal2D;
            }

            // On mobile, limit to 50 items, don't create overlay & use basic modal
            // without the flip animation due to clipping bugs.
            if (DeviceHelpers.isMobile()) {
                self.options.itemData.splice(50);
                self.options.createOverlay = false;
                self.options.modalConstructor = BasicModal2D;
            }

            self.options.itemData.splice(20);
            // create/add lightbox
            self.lightbox = new Lightbox(self.options);
            self.add(self.lightbox);
    //        cb();
        }, 2)

    }

    BasicLightboxApp.prototype._addPanel = function _addPanel () {
        var mod = new Modifier({
            transform: Transform.translate(0, 0, 5)
        });

        // Slider values
        var initialColumnGutter = this.lightbox.getColumnGutters();
        var columnGutterRange   = [0, initialColumnGutter * 5];
        var initialRowGutter    = this.lightbox.getRowGutters();
        var rowGutterRange      = [0, initialRowGutter * 5];
        var initialTopMargin    = this.lightbox.getTopMargin();
        var topMarginRange      = [initialTopMargin, initialTopMargin * 5];
        var initialLeftMargin   = this.lightbox.getLeftMargin();
        var leftMarginRange     = [0, Math.max(initialLeftMargin * 8, 150)];
        var initialRightMargin  = this.lightbox.getRightMargin();
        var rightMarginRange    = [0, Math.max(initialRightMargin * 8, 150)];

        var self = this;

        this.leftMTrans = new Transitionable(45);
        this.leftMarginSlider = new UITextSlider({
            id: 'lightbox-leftMargin',
            text: 'Left Margin',
            onChange: function (value) {
                self.lightbox.adjustLeftMargin(value);
            },
            defaultValue : initialLeftMargin,
            range        : leftMarginRange,
            textClasses: ['slider-text']
        });

        var changeSelectedItemSlider = new UITextSlider({
            id: 'lightbox-changeSelectedItem',
            text: 'Change Selected Item',
            onChange: function (value) {
                value = Math.floor(value);
                self.lightbox._onGridItemMouseover(value);
            },
            defaultValue : 0,
            range        : [0, self.lightbox._items.length - 1],
            textClasses: ['slider-text']
        });

        var toggleModalCheckbox = new UICheckBox({
            id: 'toggleModal',
            size:[140, 30],
            text:'Toggle Modal',
            checkColor: '#AFFEF7',
            labelStyle: {
                fontFamily: 'Avenir',
                fontSize: 12,
                color:'#eaeaea'
            },
            on: {
                change: function()
                {
                    if (this.getValue()) {
                        // Display modal
                        var index = changeSelectedItemSlider.get();
                        self.lightbox._onGridItemMouseover(index);
                        self.lightbox._onGridItemClick(index);
                    }
                    else {
                        // Hide modal
                        self.lightbox._animateModalOut();
                    }
                }
            }
        });

        var gridPushBackDropDown = this._createCurveDropdown(
            BasicLightboxApp.GRID_PUSH_BACK_CURVES,
            BasicLightboxApp.GRID_PUSH_BACK_CB
        );

        var modalFlipDropDown = this._createCurveDropdown(
            BasicLightboxApp.MODAL_FLIP_CURVES,
            BasicLightboxApp.MODAL_FLIP_CB
        );

        var modalSizeDropDown = this._createCurveDropdown(
            BasicLightboxApp.MODAL_SIZE_CURVES,
            BasicLightboxApp.MODAL_SIZE_CB
        );

        var colorPalleteButton = new UIButton({
            text: 'Change Pallete',
            labelClasses: ['ui-dropdown-label', 'last-button'],
            backgroundClasses: ['ui-dropdown-background'],
            backgroundPosition: [0, 0, -1],
            size: [150, 30]
        });
        var palleteCount = 0;
        colorPalleteButton.on('click', function(){
            self.lightbox.changePallete(palleteCount++ % BasicItem.PALLETES.length);
        });

        this._panel = new PanelUI([
            ///////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////
            new UILabel({
                text: 'Grid Options',
                classes: ['label-text', 'first-label']
            }),

            /*---------------------------------------------------------------*/
            // Column Label/Slider
            new UITextSlider({
                id: 'lightbox-columnGutters',
                text: 'Column Gutters',
                onChange: function (value) {
                    self.lightbox.adjustColumnGutters(value);
                },
                defaultValue : initialColumnGutter,
                range        : columnGutterRange,
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Row Label/Slider
            new UITextSlider({
                id: 'lightbox-rowGutters',
                text: 'Row Gutters',
                onChange: function (value) {
                    self.lightbox.adjustRowGutters(value);
                },
                defaultValue : initialRowGutter,
                range        : rowGutterRange,
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Top Margin Label/Slider
            new UITextSlider({
                id: 'lightbox-topMargin',
                text: 'Top Margin',
                onChange: function (value) {
                    self.lightbox.adjustTopMargin(value);
                },
                defaultValue : initialTopMargin,
                range        : topMarginRange,
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Left Margin Label/Slider
            this.leftMarginSlider,

            /*---------------------------------------------------------------*/
            // Right Margin Label/Slider
            new UITextSlider({
                id: 'lightbox-rightMargin',
                text: 'Right Margin',
                onChange: function (value) {
                    self.lightbox.adjustRightMargin(value);
                },
                defaultValue : initialRightMargin,
                range        : rightMarginRange,
                textClasses: ['slider-text']
            }),

            ///////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////
            new UILabel({
                text: 'Item Size Options',
                classes: ['label-text']
            }),

            /*---------------------------------------------------------------*/
            // Thumbnail Size Label/Slider
            new UITextSlider({
                id: 'lightbox-thumbnailSize',
                text: 'Thumbnail Size',
                onChange: function (value) {
                    self.lightbox.adjustItemScale(value);
                },
                defaultValue : 1,
                range        : [0.25, 1.25],
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Thumbnail Size Label/Slider
            new UITextSlider({
                id: 'lightbox-modalSize',
                text: 'Modal Size',
                onChange: function (value) {
                    self.lightbox.adjustModalScale(value);
                },
                defaultValue : 1,
                range        : [0.75, 1.25],
                textClasses: ['slider-text']
            }),

            ///////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////
            new UILabel({
                text: 'Animation Options',
                classes: ['label-text']
            }),

            /*---------------------------------------------------------------*/
            // Grid animation stagger slider
            new UITextSlider({
                id: 'lightbox-animationDuration',
                text: 'Duration',
                onChange: function (value) {
                    self.lightbox.adjustAnimationDuration(value)
                },
                defaultValue : self.lightbox.options.modalTransition.duration,
                range        : [750, 2000],
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Grid push back curves
            new UILabel({
                text: 'Push-back curve:',
                classes: ['animation-label-text']
            }),
            gridPushBackDropDown,

            /*---------------------------------------------------------------*/
            // Modal flip curves
            new UILabel({
                text: 'Modal flip curve:',
                classes: ['animation-label-text']
            }),
            modalFlipDropDown,

            // Modal flip curves
            new UILabel({
                text: 'Modal size curve:',
                classes: ['animation-label-text']
            }),
            modalSizeDropDown,

            /*---------------------------------------------------------------*/
            // Grid animation stagger slider
            new UITextSlider({
                id: 'lightbox-staggerGridResize',
                text: 'Stagger Grid Resize',
                onChange: function (value) {
                    self.lightbox.adjustGridLayoutDelay(value);
                },
                defaultValue : self.lightbox._gridLayout._totalDelay,
                range        : [0, 5000],
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Grid push back depth
            new UITextSlider({
                id: 'lightbox-pushBackDepth',
                text: 'Push-back Depth',
                onChange: function (value) {
                    self.lightbox.setZGridDepth(value);
                },
                defaultValue : self.lightbox.getGridZDepth() * -1,
                range        : [5000, 50000],
                textClasses: ['slider-text']
            }),

            /*---------------------------------------------------------------*/
            // Grid push back animation delay
            new UITextSlider({
                id: 'lightbox-delayVariance',
                text: 'Push-back Stagger',
                onChange: function (value) {
                    self.lightbox.setGridPushBackDelay(value);
                },
                defaultValue : self.lightbox._gridLayout._pushBackDelay,
                range        : [0, 2000],
                textClasses: ['slider-text']
            }),

            // Delay on additional animation
            new UITextSlider({
                id: 'lightbox-detailDelay',
                text: 'Text Detail Stagger',
                onChange: function (value) {
                    self.lightbox.setDetailDelay(value);
                },
                defaultValue : self.lightbox._additionalDetail._delay,
                range        : [0, 1000],
                textClasses: ['slider-text']
            }),

            ///////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////
            new UILabel({
                text: 'Selection Options',
                classes: ['label-text']
            }),

            /*---------------------------------------------------------------*/
            // Change the selected item using the overlay
            changeSelectedItemSlider,

            /*---------------------------------------------------------------*/
            // Toggle between displaying/hiding the modal
            toggleModalCheckbox,

            /*---------------------------------------------------------------*/
            // Toggle color pallete
            colorPalleteButton
        ]);

        // Update slider/checkbox on lightbox events
        self.lightbox.on('gridItemMouseover', function(value){
            changeSelectedItemSlider.setValue(value);
        });

        self.lightbox.on('animateModalIn', function(){
            toggleModalCheckbox.setValue(true);
        });

        self.lightbox.on('animateModalOut', function(){
            toggleModalCheckbox.setValue(false);
        });
        //------------------------------------------------//

        this.add(mod).add(this._panel);

        if (this._panel._state.activated) {
            // Display grid lines
            this._panel.$('menu').on('close', function() {
                self.lightbox.opacitateGridLines(1, {duration: 400});

                self.leftMTrans.halt();
                self.leftMTrans.set(200, {duration: 300});
                var val;
                var temp = Timer.setInterval(function(){
                    val = self.leftMTrans.get();
                    self.leftMarginSlider.setValue(val, true);
                    if (val === 200) {
                        Timer.clear(temp);
                    }
                }, 5);
            });

            // Hide grid lines
            this._panel.$('menu').on('menu', function() {
                self.lightbox.opacitateGridLines(0, {duration: 400});

                self.leftMTrans.halt();
                self.leftMTrans.set(45, {duration: 300});
                var val;
                var temp = Timer.setInterval(function(){
                    val = self.leftMTrans.get();
                    self.leftMarginSlider.setValue(val, true);
                    if (val === 45) {
                        Timer.clear(temp);
                    }
                }, 5);
            });
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    BasicLightboxApp.GRID_PUSH_BACK_CURVES = [
        'outBack',
        'linear',
        'easeOut',
        'outExpo',
        'outBounce'
    ];

    BasicLightboxApp.MODAL_FLIP_CURVES = [
        'inOutBack',
        'linear',
        'easeOut',
        'outExpo',
        'outBounce'
    ];

    BasicLightboxApp.MODAL_SIZE_CURVES = [
        'outCirc',
        'linear',
        'easeOut',
        'outExpo',
        'inOutBack'
    ];

    BasicLightboxApp.GRID_PUSH_BACK_CB = function(children, curves, data) {
        flipButtonClasses.call(this, children, data.previous, data.selected);
        this.lightbox.adjustPushBackCurve(curves[data.selected]);
    }

    BasicLightboxApp.MODAL_FLIP_CB = function(children, curves, data) {
        flipButtonClasses.call(this, children, data.previous, data.selected);
        this.lightbox.adjustModalFlipCurve(curves[data.selected]);
    }

    BasicLightboxApp.MODAL_SIZE_CB = function(children, curves, data) {
        flipButtonClasses.call(this, children, data.previous, data.selected);
        this.lightbox.adjustModalSizeCurve(curves[data.selected]);
    }

    function flipButtonClasses(children, oldIndex, currentIndex) {
        children[oldIndex].removeBackgroundClasses(['selected-button']);
        children[currentIndex].addBackgroundClasses(['selected-button']);
    }

    BasicLightboxApp.prototype._createCurveDropdown = function _createCurveDropdown(curves, onChange) {
        var buttonOpts = {
            labelClasses: ['ui-dropdown-label'],
            backgroundClasses: ['ui-dropdown-background'],
            backgroundPosition: [0, 0, -1],
            size: [150, 30]
        }

        var opts;
        var children = [];
        for (var i = 0; i < curves.length; i++) {
            var opts = Object.create(buttonOpts);
            if (i === 0) {
                opts.backgroundClasses = opts.backgroundClasses.slice();
                opts.backgroundClasses.push('selected-button')
            }
            opts.text = curves[i];
            children.push(new UIButton(opts));
        };

        return new UIDropdown({
            children: children,
            onChange: onChange.bind(this, children, curves)
        });
    }



    module.exports = BasicLightboxApp;

});
