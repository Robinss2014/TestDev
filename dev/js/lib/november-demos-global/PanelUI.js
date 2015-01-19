var View           = require('famous/core/View');
var Modifier       = require('famous/core/Modifier');
var Engine         = require('famous/core/Engine');
var Transform      = require('famous/core/Transform');
var Surface        = require('famous/core/Surface');
var UIList         = require('famous-web-components/containers/UIList');
var UIListDrawer   = require('famous-web-components/containers/UIListDrawer');
var UICollection   = require('famous-web-components/data/UICollection');
var SizeAwareView  = require('famous-scene/SizeAwareView');
var EventRecording = require('./EventRecording');
var DeviceHelper   = require('./DeviceHelper');
var Timer          = require('famous/utilities/Timer');
var PanelUIPopUp   = require('./PanelUIPopUp');

var UIContainer           = require('famous-web-components/containers/UIContainer');
var UIClipContainer       = require('famous-web-components/containers/UIClipContainer');
var UILabel               = require('famous-web-components/controls/UILabel');
var UIMenuCloseButton     = require('famous-web-components/controls/UIMenuCloseButton');
var UIBasicRenderer       = require('famous-web-components/controls/UIBasicRenderer');
var UIScaleSlider         = require('famous-web-components/controls/UIScaleSlider');
var UICheckBox            = require('famous-web-components/controls/UICheckBox');
var UIChildrenDataStorage = require('famous-web-components/data/UIChildrenDataStorage');
var UIButton              = require('famous-web-components/controls/UIButton');
var UIStretchBox          = require('famous-web-components/containers/UIStretchBox');
var UIPlayerUI            = require('famous-web-components/containers/UIPlayerUI');

function PanelUI (uiComponents, initialRecordings, displayPlayerUI) {
    SizeAwareView.apply(this, arguments);

    this._state = {
        recording: false,
        menuVisible: false,
        activated: true,
        removed: false
    }

    this._uiComponents = uiComponents;

    // Create side panel
    this._scrollableList = this._createScrollableList();
    this.app = new UIContainer({
        id: 'mainContainer',
        children: [ 
            new UIMenuCloseButton({
                position: this.options.menuButtonPosition,
                size: this.options.menuButtonSize,
                barHeight: 5,
                defaultState: 'menu',
                style: {
                    'backgroundColor': '#ffffff',
                    'borderRadius': '10px'
                },
                id: 'menu'
            }),
            this._scrollableList
        ]
    });

    //----------------------------------------------------------------------------//
    // RECORDING
    //----------------------------------------------------------------------------//
    this._recordings = {
        'Intro' : initialRecordings
    };
    this._recordName = 'Intro';
    this._recordingCount = 1;

    if (initialRecordings) {
        var self = this;
        Timer.setTimeout(function () {
            self._playingRecording = new EventRecording();
            self._playRecording();
            self._uiPlayerUI.setPlaying(true);
        }, 500);
    }
    //----------------------------------------------------------------------------//

    // Create playerUI & pop up
    this._uiPlayerUI = new UIPlayerUI();
    this._displayPlayerUI = (displayPlayerUI === undefined) ? true : displayPlayerUI;

    this._popUp = new PanelUIPopUp({
        uiPlayerUI: this._uiPlayerUI,
        recordings: this._recordings,
        getPlayerPosition: this._getPlayerPosition.bind(this)
    });

    //---------------------------- Pop up events----------------------------------//
    this._uiPlayerUI._presetsButton.on('click', function(){
        this._popUp.display();
        this._uiPlayerUI._presetsButton._iconElement.halt();
        this._uiPlayerUI._presetsButton._iconElement.setRotation([0, 0, Math.PI], {duration: 75});
    }.bind(this));

    this._popUp.on('hide', function(name){
        this._recordName = name;
        this._uiPlayerUI._presetsButton._iconElement.halt();
        this._uiPlayerUI._presetsButton._iconElement.setRotation([0, 0, 0], {duration: 75});
    }.bind(this))
    //----------------------------------------------------------------------------//

    // PanelUI should not be added to view if mobile device is detected
    if (!DeviceHelper.isMobile()) {
        this.add(this.app);
        this.add(this._uiPlayerUI);
        this.add(this._popUp);
    }

    this._init();
}

PanelUI.prototype = Object.create(SizeAwareView.prototype);
PanelUI.prototype.constructor = PanelUI;

PanelUI.DEFAULT_OPTIONS = {
    labelProperties: {
        fontFamily: 'Avenir',
        color: '#fff',
        fontSize: 14
    },
    tooltip: {
        classes: ['famous-demo-tooltip'],
        style: {
            borderRadius: '5px',
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            color: '#ffffff',
            padding: '12px',
            border: '1px solid #ccc',
            fontFamily: 'Avenir'
        },
        align: [1.1, -1],
        origin: [0.5, 0.5]
    },
    menuButtonSize: [40, 30],
    menuButtonPosition: [20, 20]
}

PanelUI.prototype.onResize = function onResize (size) {
    if (!this._state.activated) return;

    // Hide the UI Panel if the available width is below 500px
    if (size[0] < 500) {
        this._removePanel();
        return;
    }
    else if (this._state.removed && size[0] > 500) {
        this._undoRemovePanel();
    }

    this.app.getByID('list').setSize([200, size[1]]);
    this._size = size;
    var playerSize = this._uiPlayerUI.getSize();

    // set the position of the player UI
    this._uiPlayerUI.halt();
    this._uiPlayerUI.setPosition(this._getPlayerPosition(this._state.menuVisible));

    this._popUp.setPosition();

    // set the height of the scrollable panel
    this._scrollableList.setSize([200, size[1] - this._scrollableListVerticalOffset]);
}

PanelUI.prototype._getPlayerPosition = function _getPlayerPosition (isMenuOpen) {
    var playerSize = this._uiPlayerUI.getSize();
    return [
        this._size[0] * 0.5 - playerSize[0] * 0.5,
        (isMenuOpen) ? this._size[1] - playerSize[1] - 20 : this._size[1] + 10
    ]
}

PanelUI.CHECKS = { 
    hasTooltip : function (item) {
        return item._tooltip;
    },
    isScaleSlider: function (item) {
        return item instanceof UIScaleSlider;
    },
    isLabel: function (item) {
        return item instanceof UILabel;
    },
    isCheckbox: function (item) {
        return item instanceof UICheckBox;
    }
}

PanelUI.prototype.getChildren = function getChildren () {
    return this._uiComponents;
    
}
PanelUI.prototype._init = function _init () {
    var self = this;
    this._state.menuVisible = false;

    this._forEach('hasTooltip', function (item, i) {
        var opts = self.options.tooltip;
        var tooltip = item._tooltip;
        tooltip.setStyle(opts.style);
        tooltip.setAlign(opts.align);
        tooltip.setOrigin(opts.origin);
        tooltip.setClasses(opts.classes);
    });

    this._forEach('isLabel', function (item, i) {
        item.setStyle(self.options.labelProperties);
    });

    var self = this;
    for (var i = 0; i < this._uiComponents.length; i++) {
        var comp = this._uiComponents[i];
        if (comp.getValue!=null) {
            comp.on('change', function(value)
            {
                if (self._state.recording) {
                    self.recordChange(this.getID(), value);
                }
            });
        }
    }
    

    this._events();
}

PanelUI.prototype._createScrollableList = function _createScrollableList() {
    this._listDrawer = new UIListDrawer({
        position: [20, 0, 0],
        id: 'list',
        opacity: 0,
        padding: 10,
        children: this._uiComponents,
        defaultState: 'close',
        scrollbar: false
    });

    this._scrollableListVerticalOffset = this.options.menuButtonSize[1] +
                                         this.options.menuButtonPosition[1] + 10;

    // Size of container is set on reSize
    this._scrollableList = new UIClipContainer({
        containerStyles: {
            overflowY: 'scroll',
            'webkitOverflowScrolling': 'touch',
            'overflowScrolling': 'touch'
        },
        position: [-200, this._scrollableListVerticalOffset]
    });
    this._scrollableList.addChild(this._listDrawer);

    return this._scrollableList;
}

PanelUI.prototype.$ = function $ (name) {
    return this.app.getByID(name);
}; 

PanelUI.prototype.addUIElement = function (child) {
    this._listDrawer.addChild(child);
}

PanelUI.prototype.removeUIElement = function (child) {
    this._listDrawer.removeChild(child);
}


PanelUI.prototype._removePanel = function _removePanel() {
    this.$('list').setScale([0.0001, 0.0001]);
    this.$('menu').setScale([0.0001, 0.0001]);
    this._uiPlayerUI.setScale([0.0001, 0.0001]);
    this._popUp.remove();

    this._state.removed = true;
}

PanelUI.prototype._undoRemovePanel = function _undoRemovePanel() {
    this.$('list').setScale([1, 1]);
    this.$('menu').setScale([1, 1]);
    this._uiPlayerUI.setScale([1, 1]);

    this._state.removed = false;
}

PanelUI.prototype._showPanel = function _showPanel() {
    this.$('list').show();
    this._state.menuVisible = true;
    this._showPlayerUI();
    var size = this._scrollableList.getSize();
    this._scrollableList.setPosition([0, this._scrollableListVerticalOffset], {curve: 'outBack', duration: 500});
    this._popUp.setPosition();
}

PanelUI.prototype._showPlayerUI = function _showPlayerUI() {
    if (!this._displayPlayerUI) return;

    var playerSize = this._uiPlayerUI.getSize();
    this._uiPlayerUI.setDelay(500).setPosition(
        this._getPlayerPosition(true),
        {duration:250, curve:'easeInOut'}
    );
    this._uiPlayerUI.setRotation(0, 0, 0, {duration:500, curve:'easeInOut'});
    this._popUp.setOpacity(1);
}

PanelUI.prototype._hidePanel = function _hidePanel() {
    this.$('list').hide();
    this._state.menuVisible = false;
    this._hidePlayerUI();
    var size = this._scrollableList.getSize();
    this._scrollableList.setPosition([-size[0], this._scrollableListVerticalOffset], {curve: 'outBack', duration: 500});
    this._popUp.setOpacity(0, {duration: 100});
}

PanelUI.prototype._hidePlayerUI = function _hidePlayerUI() {
    if (this._displayPlayerUI) {
        this._uiPlayerUI.setPosition(
            this._getPlayerPosition(false),
            {duration:250, curve:'easeInOut'}
        );
        this._uiPlayerUI.setRotation(Math.PI/2, 0, 0, {duration:500, curve:'easeInOut'})
    }
    else {
        this._uiPlayerUI.setOpacity(0);
        this._uiPlayerUI.setScale([0.0001, 0.0001]);
    }
}

PanelUI.prototype._events = function () {
    var self = this;

    this.$('menu').on('menu', function () {
        self._hidePanel();
    });

    this.$('menu').on('close', function () {
        self._showPanel();
    });

    Engine.on('keydown', function (e) {
        if (e.keyCode == 83) { // s
            self.toggleRecord();
        }
        else if (e.keyCode == 32) { // space
            self._playRecording();
        }
        else if (e.keyCode == 27) { // escape
            self.$('list').toggleVisible();
            self.$('menu').toggle();

        }
    });

    this._uiPlayerUI.on('playerProgress', function (e) {
        self._playingRecording.seekPlayback(e);
    });

    this._uiPlayerUI.on('playerPressed', function (e) {
        self._wasPlaying = self._state.playing;
        self._pauseRecording();
    });

    this._uiPlayerUI.on('playerReleased', function (e) {
        if (self._wasPlaying) {
            self._playRecording();
        }
        self._wasPlaying = false;
    });
    
    this._uiPlayerUI.on('play', function (e) {
        self._playRecording();
    });

    this._uiPlayerUI.on('pause', function (e) {
        self._pauseRecording();
    });

    this._uiPlayerUI.on('record', function (e) {
        self._startRecord();
    });

    this._uiPlayerUI.on('stop', function (e) {
        self._stopRecord();
    });
}

PanelUI.prototype._forEach = function _forEach(key, fn) {
    for (var i = 0; i < this._uiComponents.length; i++) {
        if (PanelUI.CHECKS[key](this._uiComponents[i])) fn(this._uiComponents[i], i);
    }
}

PanelUI.prototype.toggleRecord = function toggleRecord() {
    if (this._state.recording) this._startRecord();
    else this._stopRecord();
}

PanelUI.prototype.serialize = function serialize() {
    var initialValues = [];
    for (var i = 0; i < this._uiComponents.length; i++) {
        var comp = this._uiComponents[i];
        if (comp.getValue!=null) {
            initialValues.push({id:comp.getID(), val:comp.getValue()});
        }
    }
    return initialValues;
}

PanelUI.prototype.setValueByID = function setValueByID (p_id, p_value) {
    this.$('list').getByID(p_id).setValue(p_value, true);
}

PanelUI.prototype.deserialize = function deserialize (p_state) {
    for (var i=0; i<p_state.length; i++) {
        var item = p_state[i];
        this.setValueByID(item.id, item.val);
    }
}

PanelUI.prototype._startRecord = function _startRecord () {
    this._state.recording = true;

    if (!this._playingRecording) {
        this._playingRecording = new EventRecording();
    }

    this._currentRecording = new EventRecording();
    if (this._state.playing) {
        this._currentRecording.startRecordingFromExisting(this._playingRecording);
    } else {
        this._currentRecording.startRecording(this.serialize());
    }

    if (this._recordingCount < 6) {
        this._recordName = 'Rec. '+ this._recordingCount++;
        this._uiPlayerUI._presetsButton._label.setText(this._recordName);
        this._popUp.addLabel(this._recordName);
    } else {
        this._recordName = 'Rec. 5';
        this._uiPlayerUI._presetsButton._label.setText(this._recordName);
    }
}

PanelUI.prototype.recordChange = function recordChange (p_id, p_value) {
    this._currentRecording.recordValueChange(p_id, p_value);
}

PanelUI.prototype._stopRecord = function () {
    this._state.recording = false;
    this._currentRecording.stopRecording();

    this._recordings[this._recordName] = this._currentRecording.serialize();
}

PanelUI.prototype._playRecording = function _playRecording () {
    if (this._playingRecording == null) {
        return;
    }
    this._state.playing = true;

    if (this._playingRecording.onTick == null) {
        var self = this;
        this._playingRecording.onEvent = function(p_evt) {
            if (p_evt.id=='*') {
                self.deserialize(p_evt.val);
            } else {
                self.setValueByID(p_evt.id, p_evt.val);
            }
        }

        this._playingRecording.onTick = function(p_time)
        {
            self._uiPlayerUI.setProgress(p_time);
        }
        this._playingRecording.onStop = function()
        {
            self._state.playing = false;
            self._uiPlayerUI.setPlaying(false);
            self._eventOutput.emit('donePlaying');
        }
    }

    this._playingRecording.deserialize(this._recordings[this._recordName]);
    this._playingRecording.startPlayback();
}

PanelUI.prototype._pauseRecording = function _pauseRecording () {
    if (this._state.playing) {
        this._state.playing = false;
        this._playingRecording.pausePlayback();
    }
}


module.exports = PanelUI;
