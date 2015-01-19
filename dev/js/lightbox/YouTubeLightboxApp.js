define(function(require, exports, module) {

    var SizeAwareView = require('famous-scene/SizeAwareView');
    var YouTubeLightbox = require('./YouTubeLightbox');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Timer = require('famous/utilities/Timer');

// Sliders
    var PanelUI = require('november-demos-global/PanelUI');
    var UIIconSlider = require('famous-web-components/controls/UIScaleSlider');
    var UILabel = require('famous-web-components/controls/UILabel');
    var UITooltip = require('famous-web-components/controls/UITooltip');


    /*
     *  Application that integrates the YouTubeLightbox with a slider panel.
     *  Part of the website's 0.3 demos.
     *
     *  @class YouTubeLightboxApp
     */

    function YouTubeLightboxApp(options) {
        SizeAwareView.apply(this, arguments);
        this.options = options;

        // Overwrite background color b/c default for demos is too dark to contrast
        // with the 'Loading' placeholder.
        document.body.style.backgroundColor = 'rgb(180, 180, 180)';

        // Setting up Lightbox is asynchronous due to YouTube integration.
        // Add panel after Lightbox has been created.
        this._addLightbox(this._addPanel.bind(this));
    }

    YouTubeLightboxApp.prototype = Object.create(SizeAwareView.prototype);
    YouTubeLightboxApp.prototype.constructor = YouTubeLightboxApp;

    YouTubeLightboxApp.prototype._addLightbox = function _addLightbox(cb) {
        // Delay lightbox creation until parent size is properly defined.
        var self = this;
        Timer.after(function () {
            self.YTL = new YouTubeLightbox(self.options, self.getParentSize(), cb);
            self.add(self.YTL);
        }, 1)

    }

    YouTubeLightboxApp.prototype._addPanel = function _addPanel() {
        // Slider values
        var initialColumnGutter = this.YTL.lightbox.getColumnGutters();
        var columnGutterRange = [0, initialColumnGutter * 5];
        var initialRowGutter = this.YTL.lightbox.getRowGutters();
        var rowGutterRange = [0, initialRowGutter * 5];
        var initialTopMargin = this.YTL.lightbox.getTopMargin();
        var topMarginRange = [0, initialTopMargin * 5];
        var initialLeftMargin = this.YTL.lightbox.getLeftMargin();
        var leftMarginRange = [0, Math.max(initialLeftMargin * 8, 150)];
        var initialRightMargin = this.YTL.lightbox.getRightMargin();
        var rightMarginRange = [0, Math.max(initialRightMargin * 8, 150)];

        var self = this;
        this._panel = new PanelUI([
            /*---------------------------------------------------------------*/
            // Column Label/Slider
            new UILabel({text: 'Column Gutters'}),

            new UIIconSlider({
                id: 'lightbox-columnGutters',
                onChange: function (value) {
                    self.YTL.lightbox.adjustColumnGutters(value);
                },
                defaultValue: initialColumnGutter,
                range: columnGutterRange
            }),

            /*---------------------------------------------------------------*/
            // Row Label/Slider
            new UILabel({text: 'Row Gutters'}),

            new UIIconSlider({
                id: 'lightbox-rowGutters',
                onChange: function (value) {
                    self.YTL.lightbox.adjustRowGutters(value);
                },
                defaultValue: initialRowGutter,
                range: rowGutterRange
            }),

            /*---------------------------------------------------------------*/
            // Top Margin Label/Slider
            new UILabel({text: 'Top Margin'}),

            new UIIconSlider({
                id: 'lightbox-topMargin',
                onChange: function (value) {
                    self.YTL.lightbox.adjustTopMargin(value);
                },
                defaultValue: initialTopMargin,
                range: topMarginRange
            }),

            /*---------------------------------------------------------------*/
            // Left Margin Label/Slider
            new UILabel({text: 'Left Margin'}),

            new UIIconSlider({
                id: 'lightbox-leftMargin',
                onChange: function (value) {
                    self.YTL.lightbox.adjustLeftMargin(value);
                },
                defaultValue: initialLeftMargin,
                range: leftMarginRange
            }),

            /*---------------------------------------------------------------*/
            // Right Margin Label/Slider
            new UILabel({text: 'Right Margin'}),

            new UIIconSlider({
                id: 'lightbox-rightMargin',
                onChange: function (value) {
                    self.YTL.lightbox.adjustRightMargin(value);
                },
                defaultValue: initialRightMargin,
                range: rightMarginRange
            }),

            /*---------------------------------------------------------------*/
            // Thumbnail Size Label/Slider
            new UILabel({text: 'Thumbnail Size'}),

            new UIIconSlider({
                id: 'lightbox-thumbnailSize',
                onChange: function (value) {
                    self.YTL.lightbox.adjustItemScale(value);
                },
                defaultValue: 1,
                range: [0.25, 1.25]
            }),

            /*---------------------------------------------------------------*/
            // Grid animation stagger slider
            new UILabel({text: 'Stagger Grid Resize'}),

            new UIIconSlider({
                id: 'lightbox-staggerGridREsize',
                onChange: function (value) {
                    self.YTL.lightbox.adjustGridLayoutDelay(value);
                },
                defaultValue: self.YTL.lightbox._gridLayout._totalDelay,
                range: [0, 3000]
            })
        ]);

        // Move the panel in front of the demo's content.
        var mod = new Modifier({
            transform: Transform.translate(0, 0, 5)
        });

        this.add(mod).add(this._panel);
        this._addPanelEvents();
    }

    YouTubeLightboxApp.prototype._addPanelEvents = function _addPanelEvents() {
        var self = this;

        if (this._panel._state.activated) {
            // Display grid lines
            this._panel.$('menu').on('close', function () {
                self.YTL.lightbox.opacitateGridLines(1, {duration: 400});
            });

            // Hide grid lines
            this._panel.$('menu').on('menu', function () {
                self.YTL.lightbox.opacitateGridLines(0, {duration: 400});
            });
        }
    }

    module.exports = YouTubeLightboxApp;
});
