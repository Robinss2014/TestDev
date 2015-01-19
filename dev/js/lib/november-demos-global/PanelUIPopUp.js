var View           = require('famous/core/View');
var Modifier       = require('famous/core/Modifier');
var Engine         = require('famous/core/Engine');
var Transform      = require('famous/core/Transform');
var Surface        = require('famous/core/Surface');
var TransTransform = require('famous/transitions/TransitionableTransform');
var Transitionable = require('famous/transitions/Transitionable');
var Timer          = require('famous/utilities/Timer');

var UIStretchBox   = require('famous-web-components/containers/UIStretchBox');
var UILabel        = require('famous-web-components/controls/UILabel');

function PanelUIPopUp () {
    View.apply(this, arguments);

    this._uiPlayerUI = this.options.uiPlayerUI;

    this._getPlayerPosition = this.options.getPlayerPosition;
    this._boundHidePopUp = function(i) {
        if (this._isDisplayed) {
            this._currentLabelName = this._labels[this._index].getText();
            this.hide();
            this._eventOutput.emit('hide', this._currentLabelName);
        }
        document.removeEventListener('click', this._boundHidePopUp);
    }.bind(this);

    this._width = this._uiPlayerUI._presetW + 
                  this._uiPlayerUI._padding;

    this._index = 0;
    this._isDisplayed = false;

    this._labelNames = [];
    for (var name in this.options.recordings) {
        this._labelNames.push(name);
    }

    this._labels = [];

    this._init();
}

PanelUIPopUp.prototype = Object.create(View.prototype);
PanelUIPopUp.prototype.constructor = PanelUIPopUp;

PanelUIPopUp.DEFAULT_OPTIONS = {
    uiPlayerUI: null,
    getPlayerPosition: null,
    labelPadding: [0, 15],
    buttonBarVerticalMargin: 15,
    initialDelay: 0, 
    delayStep: 75,
    recordings: {'Intro' : null}
}

PanelUIPopUp.prototype._init = function _init() {
    this._stretchBox = new UIStretchBox({
        direction: 'y',
        padding: 5
    });

    var label;
    for (var i = 0; i < this._labelNames.length; i++) {
        this.addLabel(this._labelNames[i]);
    };

    this._trans = new TransTransform();
    this._opacity = new Transitionable(0);

    this._mod = new Modifier({
        opacity: this._opacity,
        transform: this._trans
    });
    this._trans.setScale([0.0001, 0.0001]);

    this.add(this._mod).add(this._stretchBox);
}

PanelUIPopUp.prototype.addLabel = function addLabel (name) {
    var label = new UILabel({
        text: name,
        size: [this._width, true],
        classes: ['ui-timer', 'ui-popup-label'],
        style: {
            paddingTop: this.options.labelPadding[1]/2 + 'px',
            paddingBottom: this.options.labelPadding[1]/2 + 'px',
        }
    });
    this._addLabelEvents(label, this._labels.length);

    this._labels.push(label);
    this._stretchBox.addChild(label);

    return label;
}

PanelUIPopUp.prototype._addLabelEvents = function _addLabelEvents (label, index) {
    var self = this;

    label.on('click', function(label){
        self._index = index;
    }.bind(this, label));
}

PanelUIPopUp.prototype.setScale = function setScale (scale) {
    this._trans.setScale(scale)
}

PanelUIPopUp.prototype.setPosition = function setPosition () {
    var pos = this._getPosition();
    this._trans.setTranslate(pos);
}

PanelUIPopUp.prototype.setOpacity = function setOpacity (value, transition) {
    this._opacity.set(value, transition);
}

PanelUIPopUp.prototype.remove = function remove () {
    this._trans.setScale([0.0001, 0.0001]);
    this._isDisplayed = false;
    this._boundHidePopUp();
}

PanelUIPopUp.prototype.display = function display () {
    if (this._isDisplayed === true) return;
    this._isDisplayed = true;

    // Display pop up
    this.setPosition();

    // Animate in pop up node
    this._trans.setScale([1, 1]);
    this._opacity.set(1);

    // Animate indivial label buttons
    var transition = {duration: 400, curve: 'outExpo'};
    var delay = this.options.initialDelay;
    var delayStep = this.options.delayStep;
    var label;
    var currentTranslation;
    for(var i = this._labels.length - 1; i >= 0 ; i--) {
        label = this._labels[i];
        label.halt();

        // set initial position
        currentTranslation  = label.getTranslation();
        label.setPosition(currentTranslation[0], currentTranslation[1] + 25);
        label.setRotation([0, 0, Math.PI / 3]);
        label.setOpacity(0);


        // set delay
        label.setDelay(delay);
        delay += delayStep;

        // animate to final position
        label.setPosition(currentTranslation, transition);
        label.setRotation([0, 0, 0], transition);
        label.setOpacity(1, transition);
    }

    // Set event handler to hind pop up on click
    // Delay adding event bt 1 engine ticket b/c otherwise the initial
    // click get caught by event handler and prematurely calls _boundHidePopUp
    var self = this;
    Timer.after(function(){
        document.addEventListener('click', self._boundHidePopUp);
    }, 1);
}

PanelUIPopUp.prototype.hide = function hide () {
    if (this._isDisplayed === false) return;
    this._isDisplayed = false;

    // Hide button
    this._uiPlayerUI._presetsButton.setOpacity(0, {duration: 200});

    // Animate indivial label buttons
    var self = this;

    var opacityTrans     = {duration: 400, curve: 'outExpo'};
    var translationTrans = {duration: 100, curve: 'linear'};
    var delay            = this.options.initialDelay;
    var delayStep        = this.options.delayStep;
    var label;
    var currentTranslation;
    for(var i = 0; i < this._labels.length; i++) {
        label = this._labels[i];
        label.halt();

        // set delay
        label.setDelay(delay);
        delay += delayStep;

        if (i === this._index) {
            // animate to final position
            currentTranslation  = label.getTranslation();
            label.setPosition([currentTranslation[0], currentTranslation[1], 10]);
            label.setPosition(
                [
                    currentTranslation[0],
                    this._stretchBox.getSize()[1] + this.options.buttonBarVerticalMargin + this._uiPlayerUI.getSize()[1]/2 - label.getSize()[1]/2,
                    0
                ],
                translationTrans,
                function(label){
                    // Hide label
                    label.setOpacity(0, {duration: 100}, function(label){
                        label.setPosition(currentTranslation);

                        self._opacity.set(0);
                        self._trans.setScale([0.001, 0.001]);
                    }.bind(null, label));

                    self._uiPlayerUI._presetsButton._label.setText(self._currentLabelName);
                    self._uiPlayerUI._presetsButton.setOpacity(1, {duration: 100});
                }.bind(null, label)
            );
        } else {
            label.setOpacity(0, opacityTrans);
        }
    }
}

PanelUIPopUp.prototype._getPosition = function _getPosition () {
    var menuPos = this._getPlayerPosition(true);
    return [
        menuPos[0],
        menuPos[1] - this._stretchBox.getSize()[1] - this.options.buttonBarVerticalMargin,
    ]
}

module.exports = PanelUIPopUp;