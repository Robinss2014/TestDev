// TODO: refactor to follow UISlider style ~ Imti
define(function(require, exports, module) {
    var UIComponent        = require('../core/UIComponent');
    var UIClippedComponent = require('../core/UIClippedComponent');
    var UIElement          = require('../core/UIElement');
    var UIStretchBox       = require('../containers/UIStretchBox');
    var UILabel            = require('../controls/UILabel');
    var UIBoundingBox      = require('../controls/UIBoundingBox');
    var UIButtonBase      = require('../controls/UIButtonBase');
    var UIBackground      = require('../controls/button/UIBackground');
    var Transform          = require('famous/core/Transform');

    var UINumericStepper   = UIComponent.extend( /** @lends UIComponent.prototype */ {

        /**
         * @method constructor
         * @param options
         */
        constructor: function(options) {
            options                    = options                      || {};
            this._callSuper(UIComponent, 'constructor', options);

            this._direction                     = options.direction                     || 'x';
            this._showButtons                   = options.showButtons                   || false;
            this._range                         = options.range                         || [0,10]; // the range of the numeric values
            this._step                          = options.step                          || 1; // the step to take through the range. e.g. a step of 1 means if your range is [0,10.5], then you get 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, but not 10.5.
            this._prefix                        = options.prefix                        || ""; // e.g. in $5, $ is the prefix and 5 is the value.
            this._suffix                        = options.suffix                        || ""; // e.g. in 5px, 5 is the value and px is the suffix.
            this._backgroundProperties          = options.backgroundProperties          || {};
            this._containerBackgroundProperties = options.containerBackgroundProperties || {};
            this._buttonProperties              = options.buttonProperties              || {};

            var valuesAndLabels = this._createValuesAndLabels();
            this._values = valuesAndLabels[0];
            this._labels = valuesAndLabels[1];
            this._currentValue = this._range[0]; // the beginning of the range is the default value.

            // TODO: Creating backgrounds is a repeated pattern. move background creation closer to UIBase?
            this._background = this._createBackground();
            this._addChild(this._background);

            // TODO: Creating backgrounds is a repeated pattern. move background creation closer to UIBase?
            this._containerBackground = this._createContainerBackground();
            this._addChild(this._containerBackground);

            // create the number container.
            this._container = this._createContainer();
            this._addChild(this._container);

            // Create the StretchBox that will contain the stepper values.
            this._stretchbox = this._createStretchbox();
            this._container._addChild(this._stretchbox);

            // TODO: creating bounding boxes is a repeated pattern. move boundingbox creation closer to UIBase?
            this._boundingBox = this._createBoundingBox();
            this._addChild(this._boundingBox);

            this._bindEvents();

            this._update();
        },

        /**
         * @method _createValuesAndLabels
         * @private
         */
        _createValuesAndLabels: function() {
            var values = [];
            var labels = [];
            for (var i=this._range[0]; i<=this._range[1]; i++) {
                values.push(i);
                labels.push(new UILabel({
                    text: ""+this._prefix+i+this._suffix,
                    style: {
                        padding: '3px',
                        background: 'transparent'
                    }
                }));
            }
            return [values, labels];
        },

        /**
         * Creates the backgound
         *
         * @private
         * @method _createBackground
         */
        _createBackground: function() {
            return new UIElement({
                style: this._backgroundProperties,
            });
        },

        /**
         * Creates the backgound
         *
         * @private
         * @method _createBackground
         */
        _createContainerBackground: function() {
            return new UIElement({
                style: this._containerBackgroundProperties,
            });
        },

        /**
         * @method _createContainer
         * @private
         */
        _createContainer: function() {
            return new UIClippedComponent();
        },

        /**
         * @method _createStretchbox
         * @private
         */
        _createStretchbox: function() {
            return new UIStretchBox({
                direction: this._direction,
                children: this._labels,
                evenlySpaced: true,
            });
        },

        /**
         * Creates the bounding box
         *
         * @private
         * @method _createBoundingBox
         */
        _createBoundingBox: function() {
            return new UIBoundingBox({
                //position: [10,10, 0],
                style: {
                    cursor: this._direction === 'x' ? "ew-resize" : "ns-resize"
                },
            });
        },

        _createButtons: function(prevSize, nextSize) {
            var thisStepper = this;
            var MyButton = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
                constructor: function(options) {
                    options = options || {};
                    this._options = options;
                    this._callSuper(UIButtonBase, 'constructor', options);
                },
                _createBackground: function () {
                    return new UIElement({
                        style: thisStepper._buttonProperties,
                    });
                },
            });

            var previousButton = new MyButton({
                size: prevSize,
                text: this._direction === 'x' ? "<" : 'v',
            });
            var nextButton = new MyButton({
                size: nextSize,
                text: this._direction === 'x' ? ">" : '^',
            });

            previousButton.on('click', function() {
                if (--this._currentValue < this._values[0]) this._currentValue = this._values[0];
                this.emit('change');
                var largest = this._stretchbox._largestChildSize;
                var thisDirection = +(this._direction === 'y');
                var newPosition = [0,0,0];
                // FIXME: make a this._targetPosition variable that holds the target position instead of relying on getting the stretchbox's current position to calculate the next potition because the current position won't be where you expect if it's animating.
                if (this._stretchbox.getPosition()[thisDirection] < 0) {
                    newPosition[thisDirection] = this._stretchbox.getPosition()[thisDirection] + largest[thisDirection];
                    this._stretchbox.setPosition(newPosition, {duration: 500, curve: "outBounce"});
                }
            }.bind(this));

            nextButton.on('click', function() {
                if (++this._currentValue > this._values[this._values.length-1]) this._currentValue = this._values[this._values.length-1];
                this.emit('change');
                var largest = this._stretchbox._largestChildSize;
                var thisDirection = +(this._direction === 'y');
                var newPosition = [0,0,0];
                // FIXME: make a this._targetPosition variable that holds the target position instead of relying on getting the stretchbox's current position to calculate the next potition because the current position won't be where you expect if it's animating.
                if (this._stretchbox.getPosition()[thisDirection] > -this._stretchbox.getSize()[thisDirection]+largest[thisDirection]) {
                    newPosition[thisDirection] = this._stretchbox.getPosition()[thisDirection] - largest[thisDirection];
                    this._stretchbox.setPosition(newPosition, {duration: 500, curve: "outBounce"});
                }
            }.bind(this));

            if (previousButton.getSize()[0] > nextButton.getSize()[0]) {
                nextButton.setSize(previousButton.getSize()[0], nextButton.getSize()[1]);
            }
            else {
                previousButton.setSize(nextButton.getSize()[0], previousButton.getSize()[1]);
            }

            if (previousButton.getSize()[1] > nextButton.getSize()[1]) {
                nextButton.setSize(nextButton.getSize()[0], previousButton.getSize()[1]);
            }
            else {
                previousButton.setSize(previousButton.getSize()[0], nextButton.getSize()[1]);
            }

            return {
                previous: previousButton,
                next: nextButton,
            };
        },

        _bindEvents: function() {
            this._boundingBox.on('dragUpdate', this._onDragUpdate.bind(this));
            this._boundingBox.on('dragEnd', this._onDragEnd.bind(this));
            this._stretchbox.on("stretchBoxResize", this._onStretchboxSizeChange.bind(this));
            this._stretchbox.on("click", function() {}.bind(this));
        },

        _onDragEnd: function(event) {
            var box = this._stretchbox;
            var thisDirection = +(this._direction === 'y');
            var largest = box._largestChildSize;
            var currentPosition = box.getPosition();
            var newPosition = [0,0];

            // currentPosition can only be negative currently.
            var mod = (-currentPosition[thisDirection]) % largest[thisDirection];
            var half = largest[thisDirection]/2.0;

            if (mod < half) {
                newPosition[thisDirection] = currentPosition[thisDirection] + mod;
            }
            else {
                newPosition[thisDirection] = currentPosition[thisDirection] + mod - largest[thisDirection];
            }

            box.setPosition([ newPosition[0], newPosition[1] ], {duration: 500, curve: 'outBounce'});
            this._currentValue = this._values[ (-newPosition[thisDirection]) / largest[thisDirection] ]; // FIXME: this won't work in the future when sizing of the stretchbox is restricted by some outer container.
            this.emit('change');
        },

        _onDragUpdate: function(event) {
            var box = this._stretchbox;
            var delta = event.delta;
            var thisDirection = +(this._direction === 'y');
            var size = box.getSize();
            var largest = box._largestChildSize;
            var currentPosition = box.getPosition();
            var newPosition = [0,0];

            if (currentPosition[thisDirection] + delta[thisDirection] > 0) {
                newPosition[thisDirection] = 0;
            }
            else if (currentPosition[thisDirection] + delta[thisDirection] < -size[thisDirection]+largest[thisDirection]) {
                newPosition[thisDirection] = -size[thisDirection]+largest[thisDirection];
            }
            else {
                newPosition[thisDirection] = currentPosition[thisDirection] + delta[thisDirection];
            }

            box.setPosition([ newPosition[0], newPosition[1] ]);
        },

        _onStretchboxSizeChange: function() {

            var thisDirection = +(this._direction === 'y');
            var largest = [0,0]; largest = this._stretchbox._largestChildSize;
            //var buttonSize = this._buttons.previous.getSize();
            var buttonSize = [20,20];

            this._container.setSize(largest[0], largest[1]);
            var containerSize = this._container.getSize();

            this._boundingBox.setSize(containerSize);
            this._containerBackground.setSize(containerSize);

            if (this._direction === 'y') {
                this.setSize(containerSize[0] + buttonSize[0], containerSize[1]);

                // create buttons.
                this._buttons = this._createButtons([buttonSize[0], this._container.getSize()[1]/2], [buttonSize[0], this._container.getSize()[1]/2]);
                this._addChild(this._buttons.previous);
                this._addChild(this._buttons.next);

                this._buttons.next.setPosition(containerSize[0], 0, 0);
                this._buttons.previous.setPosition(containerSize[0], containerSize[1]/2, 0);
            }
            else if (this._direction === 'x') {
                this.setSize(containerSize[0] + buttonSize[0]*2, containerSize[1]);

                // create buttons.
                this._buttons = this._createButtons([buttonSize[0], this._container.getSize()[1]], [buttonSize[0], this._container.getSize()[1]]);
                this._addChild(this._buttons.previous);
                this._addChild(this._buttons.next);

                this._buttons.previous.setPosition(0, 0, 0);
                this._container.setPosition(buttonSize[0], 0, 0);
                this._containerBackground.setPosition(this._container.getPosition());
                this._boundingBox.setPosition(this._container.getPosition());
                this._buttons.next.setPosition(containerSize[0] + buttonSize[0], 0, 0);
            }
        },

        /**
         * @method setSize
         * @param width
         * @param height
         * @param  transition
         * @param  callback
         */
        setSize: function(width, height, transition, callback) {
            this._callSuper(UIComponent, 'setSize', width, height, transition, callback);
        },

        getValue: function() {
            return this._currentValue;
        },

        /**
         * @method _update
         * @private
         */
        _update: function() {
        }
    });

    module.exports = UINumericStepper;
});
