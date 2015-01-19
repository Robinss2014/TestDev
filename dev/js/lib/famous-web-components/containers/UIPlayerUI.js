define(function(require, exports, module) {
    var UIContainer = require('../containers/UIContainer');
    var UIStretchBox = require('../containers/UIStretchBox');
    var UIScaleSlider = require('../controls/UIScaleSlider');
    var UIIconSlider = require('../controls/UIIconSlider');
    var UIFlipComponent = require('../controls/UIFlipComponent');
    var UIElement = require('../core/UIElement');
    var UIClipContainer = require('../containers/UIClipContainer');
    var UITimer = require('../controls/UITimer');
    var UIPopUpButton = require('../controls/UIPopUpButton');

    var UIPlayerUI = UIClipContainer.extend({ 
        _buttonSize: 25,
        _padding: 20,
        _containerClasses: ['ui-record-background'],

        constructor: function UIPlayerUI (options) {
            this._callSuper(UIClipContainer, 'constructor', options);

            this._state = {
                recording: false,
                playing: false
            }
            this._presetW = 60;


            this._containerSurface.setProperties({
                backgroundColor: 'rgba(120,120,120,0.5)',
                borderRadius: '5px'

            });
            
            var size = this.getSize();

            this._presetsButton = new UIPopUpButton(
            {
                size:[this._presetW, 45],
                text:'Intro',
                labelClasses: ['ui-timer']
            })            
            this._vLine = new UIElement({
                size:[1, size[1]-2*this._padding],
                style:{backgroundColor:'#999999'}
            });
            this._playerProgress = new UIIconSlider({ 
                size: [
                    size[0] - (this.options.padding * 4 + this._buttonSize * 2), 
                    this._buttonSize
                ],
                defaultValue: 0,
                range: [0, 1],
                fillStyle: {
                    backgroundColor: '#ddd'
                },
                fillBgStyle: {
                    backgroundColor: '#777'
                },
                iconStyle: {
                    backgroundColor: '#eee',
                    borderRadius: '50%',
                    border: '1px solid #fff',
                }
            });

            this._playPauseFlip = new UIFlipComponent({
                position: [0, 40, 0],
                components: { 
                    'play': new UIElement({ 
                        content: '<img src="https://s3-us-west-1.amazonaws.com/demo.famo.us/november-demos/play.svg"/>',
                        size: [this._buttonSize, this._buttonSize],
                    }),
                    'pause': new UIElement({ 
                        content: '<img src="https://s3-us-west-1.amazonaws.com/demo.famo.us/november-demos/pause.svg"/>',
                        size: [this._buttonSize, this._buttonSize],
                    })
                }
            });

            this._recordStopFlip = new UIFlipComponent({ 
                components: { 
                    'record': new UIElement({ 
                        content: '<img src="https://s3-us-west-1.amazonaws.com/demo.famo.us/november-demos/record.svg"/>',
                        size: [this._buttonSize, this._buttonSize],
                    }),
                    'stop': new UIElement({ 
                        content: '<img src="https://s3-us-west-1.amazonaws.com/demo.famo.us/november-demos/stop.svg"/>',
                        size: [this._buttonSize, this._buttonSize],
                    })
                }
            });

            this._timer = new UITimer({
                opacity: 0
            });

            this._addChild(this._vLine);
            this._addChild(this._playerProgress);
            this._addChild(this._playPauseFlip);
            this._addChild(this._recordStopFlip);
            this._addChild(this._timer);
            this._addChild(this._presetsButton);
            this.setSize(this.getSize());
            this._bindEvents();
        },
        defaults: {
            size: [400, 65],
            buttonSize: 25,
            padding: 10,
            sliderHeight: 20,
            transition: {
                curve: 'outBack',
                duration: 500
            }
        },

        setProgress: function (e) {
            this._playerProgress.setValue(e);
        },

        setSize: function (width, height, transition, callback) {
            this._callSuper(UIContainer, 'setSize', width, height, transition, callback);
            if (!this._playerProgress) return;

            var w = (width instanceof Array) ? width[0] : width;
            var h = (height instanceof Array) ? height[0] : height;
            var centerSize = [
                w - this._padding * 5 - this._buttonSize * 2 - this._presetW, 
                this.options.sliderHeight
            ];
            this._vLine.setSize(1,65-this._padding);
            this._playerProgress.setSize(centerSize);
            this._timer.setSize(centerSize);

            this._updatePositions();
        },

        setPlaying: function (bool) {
            this._state.playing = bool;

            if (this._state.playing) this._playPauseFlip.flipTo('pause');
            else this._playPauseFlip.flipTo('play');
        },

        setRecording: function (bool) {
            this._state.recording = bool;

            if (this._state.recording) this._timer.start();
            else this._timer.stop();

            this._updatePositions();
        },

        _updatePositions: function () {
            var x = this._buttonSize + this._padding * 3 + this._presetW;
            
            this._timer.halt();
            this._playerProgress.halt();

            if (!this._state.recording) { 
                this._playerProgress.setPosition([x, - this._buttonSize, 0]);
                this._playerProgress.setPosition([
                    x, 
                    this._padding + (this._buttonSize - this._padding) * 0.5,
                    0
                ], this.options.transition);
                this._timer.setPosition([x, this.getSize()[1]], this.options.transition);
                this._timer.setOpacity(0, this.options.transition);
            } else {
                this._playerProgress.setPosition([x, this.getSize()[1], 0], this.options.transition);
                this._timer.setPosition([x, 0, 0]);
                this._timer.setDelay(200);
                this._timer.setPosition([x, this._padding], this.options.transition);
                this._timer.setOpacity(1, this.options.transition);
            }
            this._vLine.setPosition(this._presetW+this._padding, this._padding/2, 0);
            this._playPauseFlip.setPosition([2*this._padding + this._presetW, this._padding, 0]);
            this._recordStopFlip.setPosition([this.getSize()[0] - this._buttonSize - this._padding, this._padding]);

            this._presetsButton.setPosition(this._padding/2, this._padding/2, 0);
        },

        _bindEvents: function () {
            var self = this;
            this._playerProgress.on('change', function (e) { 
                self.emit('playerProgress', e);
            });
            this._playerProgress.on('dragStart', function (e) { 
                self.emit('playerPressed', e);
            });
            this._playerProgress.on('dragEnd', function (e) { 
                self.emit('playerReleased', e);
            });
            this._playPauseFlip.on('flip', function (e) {
                self.emit(e);
            });
            this._recordStopFlip.on('flip', function (e) {
                self.emit(e);
                if (e == 'record') self.setRecording(true);
                else self.setRecording(false);
            });
        }
    });

    module.exports = UIPlayerUI;
});
