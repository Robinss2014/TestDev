define(function(require, exports, module) {

    var UIBase = require('../core/UIBase');
    var Timer = require('famous/utilities/Timer');
    var Transitionable = require('famous/transitions/Transitionable');
    var Utils = require('../utils/Utils');
    var Controller = require('./Controller');

    var LOCAL_STORAGE_ENBALED = !!window.localStorage;
    var KEY_ID = 0;

    function UIChildrenDataStorage (parentElement, options) {
        Controller.call(this, options);
        this._parentElement = parentElement;
        this._data          = {};
        this._startData     = {};
        this._timers        = {
            playback: {}
        };
        this._recordedData  = {};
        this._playBackstate = {};
        this._trans         = new Transitionable(0);
        this._id            = this.options.id || KEY_ID++;
        this._paused        = false;
        if (this.options.autoLoad) this.loadFromLocalStorage();
    }
    UIChildrenDataStorage.prototype = Object.create(Controller.prototype);
    UIChildrenDataStorage.prototype.constructor = UIChildrenDataStorage;

    UIChildrenDataStorage.PREFIX = 'famous-ui';

    UIChildrenDataStorage.DEFAULT_OPTIONS = { 
        autoSave: true,
        autoLoad: true,
        id: undefined
    }

    /**
     * @method setItems
     * @param items
     */
    UIChildrenDataStorage.prototype.setItems = function (items) {
        this._items = items;
    }

    /**
     * @method saveValues
     * @param key
     */
    UIChildrenDataStorage.prototype.saveValues = function (key) {
        if (!key) key = KEY_ID++;

        if (!this._data[key]) {
            this._data[key] = {};
        }

        this._data[key] = this.getCurrentValues();
    }

    /**
     * @method getCurrentValues
     */
    UIChildrenDataStorage.prototype.getCurrentValues = function () {
        var self = this;
        var obj = {};
        this.forEachChild(this._parentElement, function (childElement) {
            var id = childElement.getID();
            if (childElement.getValue) {
                obj[id] = childElement.getValue();
            }
        });
        return obj;
    }

    /**
     * @method loadFromLocalStorage
     */
    UIChildrenDataStorage.prototype.loadFromLocalStorage = function () {
        if (LOCAL_STORAGE_ENBALED) {
            var storage = localStorage.getItem(this._getLocalStorageID());
            if (storage) {
                var obj = JSON.parse(storage);
                for (var key in obj._data) this._data[key] = obj._data[key];
                for (var key in obj._recordedData) this._recordedData[key] = obj._recordedData[key];
            }
        }
    }

    /**
     * @method saveToLocalStorage
     */
    UIChildrenDataStorage.prototype.saveToLocalStorage = function () {
        if (LOCAL_STORAGE_ENBALED) {
            var obj = {
                _data: this._data,
                _recordedData: this._recordedData
            }
            localStorage.setItem(this._getLocalStorageID(), JSON.stringify(obj));
        }
    }

    /**
     * @method _getLocalStorageID
     * @protected
     */
    UIChildrenDataStorage.prototype._getLocalStorageID = function () {
        return UIChildrenDataStorage.PREFIX + this._id;
    }

    /**
     * @method addPresets
     * @param presets
     */
    UIChildrenDataStorage.prototype.addPresets = function (presets) {
        for (var key in presets) { 
            this._data[key] = presets[key];
        }
    }

    /**
     * @method setFromObject
     * @param obj
     */
    UIChildrenDataStorage.prototype.setFromObject = function (obj) {
        for (var id in obj) {
            var component = UIBase._idRegistry[id];
            if (component && component.setValue) {
                component.setValue(obj[id]);
            }
        }
    }

    /**
     * @method updateFromKey
     * @param key
     */
    UIChildrenDataStorage.prototype.updateFromKey = function (key, transition) {
        var finalValues = this._data[key];
        if (!transition) {
            this.setFromObject(finalValues);
        }
        else {
            var self = this;
            this._startData[key] = this.getCurrentValues();

            this._trans.set(0);
            this._trans.set(1, transition, function () {
                Timer.clear(self._timerFn);
            });

            this._timers.interpolate = Timer.every(this._interpolateComponents.bind(this, key));
        }
    }

    /**
     *  @deprecated
     *  @method _interpolate
     */
    UIChildrenDataStorage.prototype._interpolateComponents = function (key) {
        var t = this._trans.get();
        var startValues = this._startData[key];
        var finalValues = this._data[key];
        for (var id in startValues) {
            if (finalValues[id] && typeof finalValues[id] == 'number') {
                var midValue = _interpolate(startValues[id], finalValues[id], t);
                var component = this._getComponentById(id);
                if (component && component.setValue) {
                    component.setValue(midValue);
                }
            }
        }
    }

    /**
     *  Generic interpolate, to replace _interpolateComponents
     */
    UIChildrenDataStorage.prototype._interpolateComponents_2 = function (startValues, endValues, t) {
        for (var id in startValues) {
            if (endValues[id] && typeof endValues[id] == 'number') {
                var midValue = _interpolate(startValues[id], endValues[id], t);
                var component = this._getComponentById(id);
                if (component && component.setValue) {
                    component.setValue(midValue);
                }
            }
        }
    }

    /**
     * @method _getComponentById
     * @protected
     * @param id
     */
    UIChildrenDataStorage.prototype._getComponentById = function (id) {
        return UIBase._idRegistry[id];
    }
    

    /**
     *  @method _interpolate
     */
    function _interpolate(a, b, t) {
        return ((1 - t) * a) + (t * b);
    }
    

    /**
     * @method forEachChild
     * @param parent
     * @param cb
     */
    UIChildrenDataStorage.prototype.forEachChild = function (parent, cb) {
        var children = parent.getChildren();
        if (children) {
            for (var i = 0; i < children.length; i++) {
                if (children[i].getChildren && children[i].getChildren().length > 0) {
                    this.forEachChild(children[i], cb);
                }
                else {
                    cb(children[i]);
                }
            };
        }
        else {
            cb(parent);
        }
    }

    /**
     * @method startRecord
     * @param key
     * @param sampleRate
     */
    UIChildrenDataStorage.prototype.startRecord = function (key, sampleRate) {
        if (!sampleRate) sampleRate = 10;
        this._recordedData[key] = {
            sampleRate: sampleRate,
            values: []
        };
        this._timers.record = Timer.every(this._onRecordTick.bind(this, key), sampleRate);
    }

    /**
     * @method playRecord
     * @param key
     */
    UIChildrenDataStorage.prototype.playRecord = function (key) {
        if (!this._recordedData[key]) {
            if (console) console.warn('No playback record matching key: ', key);
            return;
        }

        if (!this._playBackstate[key]) {
            this._playBackstate[key] = {
                frameIndex: 0,
                playbackIndex: 0
            };
            this._timers.playback[key] = Timer.every(this._onPlaybackTick.bind(this, key), 1);
        }
        else if (this._paused) {
            this._paused = false;
            if (this._timers.playback[key]) Timer.clear(this._timers.playback[key]);
            this._timers.playback[key] = Timer.every(this._onPlaybackTick.bind(this, key), 1);
        }
    }

    //@@
    UIChildrenDataStorage.prototype.pauseRecord = function (key) {
        if (this._timers.playback[key]) {
            Timer.clear(this._timers.playback[key]);
            this._timers.playback[key] = null;
            this._paused = true;
        }
    }

    /**
     * @method _onPlaybackTick
     * @protected
     * @param key
     */
    UIChildrenDataStorage.prototype._onPlaybackTick = function (key) {
        var sampleRate = this._recordedData[key].sampleRate;
        var values = this._recordedData[key].values;
        var index = this._playBackstate[key].playbackIndex;
        var frameIndex = this._playBackstate[key].frameIndex;

        var current = values[index];
        var next = values[index + 1];

        if (!next) { // none left in the chain, end.
            Timer.clear(this._timers.playback[key]);
            this._timers.playback[key] = null;
            this._playBackstate[key] = null;
            this._eventOutput.emit('stop');
        } 
        else if (frameIndex % sampleRate === 0) { // we have real data.
            this.setFromObject(next);
            this._playBackstate[key].playbackIndex++;
        }
        else if (next) { // interpolate between sampled data points
            var t = (frameIndex % sampleRate) / sampleRate;
            this._interpolateComponents_2(current, next, t);
        }

        this._eventOutput.emit('playerProgress', frameIndex / ((values.length - 2)* sampleRate));
        if (this._playBackstate[key]) this._playBackstate[key].frameIndex++;
    }

    /**
     * @method stopRecord
     * @param key
     */
    UIChildrenDataStorage.prototype.stopRecord = function (key) {
        Timer.clear(this._timers.record);
        console.log('DATA SIZE: ', getByteSize(this._recordedData[key]));
        console.log(this._recordedData);
        if (this.options.autoSave) this.saveToLocalStorage();
    }

    /**
     * @method _onRecordTick
     * @protected
     * @param key
     */
    UIChildrenDataStorage.prototype._onRecordTick = function (key) {
        this._recordedData[key].values.push(this.getCurrentValues());
    }

    UIChildrenDataStorage.prototype.setProgress = function (key, val) {
        var playbackState = this._playBackstate[key];
        var recordedData = this._recordedData[key];
        if (!playbackState || !recordedData) return false;
        var sampleRate = recordedData.sampleRate;

        playbackState.playbackIndex = Math.floor(val * recordedData.values.length);
        playbackState.frameIndex = playbackState.playbackIndex * sampleRate;
    }

    // delete after navelgazing is complete
    function getByteSize(obj) {
        var bytes = byteLength(JSON.stringify(obj));
        return bytesToSize(bytes);
    }

    function byteLength(str) {
        // returns the byte length of an utf8 string
        var s = str.length;
        for (var i=str.length-1; i>=0; i--) {
            var code = str.charCodeAt(i);
            if (code > 0x7f && code <= 0x7ff) s++;
            else if (code > 0x7ff && code <= 0xffff) s+=2;
            if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
        }
        return s;
    }

    function bytesToSize(bytes) {
        if(bytes == 0) return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }
    

    module.exports = UIChildrenDataStorage;
});
