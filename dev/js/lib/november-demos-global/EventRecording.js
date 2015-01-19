var Timer = require('famous/utilities/Timer');


function EventRecording() {
}

EventRecording.prototype = Object.create(Object.prototype);
EventRecording.prototype.constructor = EventRecording;

EventRecording.prototype.playbackTime = 0;
EventRecording.prototype._playbackEventIndex = 0;

EventRecording.prototype.startRecording = function(p_initialValues)
{
    this._recordedData = [];    
    // data is in format {t, id, val}

    this._initialTime = Date.now();
    this._recordedData.push({t:0, id:'*', val:p_initialValues});
}

EventRecording.prototype.stopRecording = function()
{
    this.totalTime = Date.now()-this._initialTime;
    console.log(this.serialize());
}

EventRecording.prototype.startRecordingFromExisting = function(p_existingRecording)
{
    // set my time offset to the playback time
    this._initialTime = Date.now()-p_existingRecording.playbackTime;

    // gather all events from the existing recording
    this._recordedData = p_existingRecording.cloneEventsToPlaybackTime();
}

EventRecording.prototype.recordValueChange = function(p_id, p_val)
{
    this._recordedData.push({t:Date.now()-this._initialTime, id:p_id, val:p_val});
}

EventRecording.prototype.cloneEventsToPlaybackTime = function()
{
    return this._recordedData.slice(0,this._playbackEventIndex);
}

EventRecording.prototype.startPlayback = function()
{
    if (this.onEvent==null || this._playbackInterval!=null) {
        return;
    }
    this._initialTime = Date.now();
    this._lastPlaybackTime = this.playbackTime;
    var self = this;
    this._playbackInterval = Timer.setInterval(function()
    {
        self.playbackTime = self._lastPlaybackTime + Date.now()-self._initialTime;
        var playbackEvent = self._recordedData[self._playbackEventIndex];
        while (playbackEvent && playbackEvent.t<=self.playbackTime) {
            self.onEvent(playbackEvent);
            playbackEvent = self._recordedData[++self._playbackEventIndex];
        }
        if (self.onTick) {
            self.onTick(self.playbackTime/self.totalTime);
        }
        if (self.playbackTime>=self.totalTime) {
            if (self.onStop) {
                self.onStop();
            }
            self.stopPlayback();
        }
    },10);
}

EventRecording.prototype.seekPlayback = function(p_timeRatio) 
{
    var ids = {};
    this.playbackTime = p_timeRatio*this.totalTime;
    this._playbackEventIndex = 0;
    // always fire the first keyframe event
    this.onEvent(this._recordedData[0]);
    var playbackEvent = this._recordedData[1];
    while (playbackEvent && playbackEvent.t<=this.playbackTime) {
        ids[playbackEvent.id] = playbackEvent;
        playbackEvent = this._recordedData[++this._playbackEventIndex];
    }
    for (var id in ids) {
        this.onEvent(ids[id]);
    }
}

EventRecording.prototype.pausePlayback = function()
{
    Timer.clear(this._playbackInterval);
    delete this._playbackInterval;
}

EventRecording.prototype.stopPlayback = function()
{
    this.pausePlayback();
    this.playbackTime = this._playbackEventIndex = 0;
}

EventRecording.prototype.serialize = function()
{
    return JSON.stringify({totalTime:this.totalTime, events:this._recordedData});
}

EventRecording.prototype.deserialize = function(p_string)
{
    var allVals = JSON.parse(p_string);
    this.totalTime = allVals.totalTime;
    this._recordedData = allVals.events;
}


module.exports = EventRecording;
