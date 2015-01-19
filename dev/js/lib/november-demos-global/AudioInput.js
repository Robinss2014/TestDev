var Timer = require('famous/utilities/Timer');


function AudioInput() {
}

AudioInput.prototype = Object.create(Object.prototype);
AudioInput.prototype.constructor = AudioInput;

AudioInput.prototype._ampState = 0.5;
AudioInput.prototype._freqState = 0;
AudioInput.prototype.startPlayback = function()
{
    if (this.onEvent==null) {
        return;
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    var self = this;
    navigator.getUserMedia( {audio:true}, function(p_stream) 
        {
            self._onStream(p_stream);
        }, function(e){});    
}

AudioInput.prototype._onStream = function(stream) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this._audioContext = new AudioContext();

    // Create an AudioNode from the stream.
    var mediaStreamSource = this._audioContext.createMediaStreamSource( stream );

    // Connect it to the destination to hear yourself (or any other node for processing!)
//    mediaStreamSource.connect( this._audioContext.destination );

    this._inputPoint = this._audioContext.createGain();
    mediaStreamSource.connect(this._inputPoint);
    this._biquadFilter = this._audioContext.createBiquadFilter();
    this._biquadFilter.type = "lowshelf";
    this._biquadFilter.frequency.value = 1000;
    this._biquadFilter.gain.value = 25;

    this._analyserNode = this._audioContext.createAnalyser();
    this._analyserNode.fftSize = 2048;

    this._inputPoint.connect(this._biquadFilter);
    this._biquadFilter.connect(this._analyserNode);
//    this._inputPoint.connect( this._analyserNode );

//    this._zeroGain = this._audioContext.createGain();
//    this._zeroGain.gain.value = 0.0;
//    this._inputPoint.connect( this._zeroGain );
//    this._zeroGain.connect( this._audioContext.destination );
    var self = this;
    this._playbackInterval = Timer.setInterval(function()
    {
        self.analyzeAudio();
    },50);
}

AudioInput.prototype._timeTicks = 0;
AudioInput.prototype._sampleSize = 1;

AudioInput.prototype.analyzeAudio = function()
{
//    var freqByteData = new Uint8Array(this._analyserNode.frequencyBinCount);
//    var freqFloatData = new Float32Array(this._analyserNode.frequencyBinCount);

//    this._analyserNode.getFloatFrequencyData(freqFloatData); 



    var timeFloatData = new Float32Array(this._analyserNode.fftSize);
    this._analyserNode.getFloatTimeDomainData(timeFloatData);

    var l = timeFloatData.length;
    var tally = 0;
    for (var i=0; i<l; i++) {
        tally+=Math.abs(timeFloatData[i]);
    }
    var amp = tally/l;
    var coeff = 0.9;
    this._ampState = this._ampState*coeff+amp*(1-coeff);
    // 10-100
    var freqCoeff = 0.9;
    this.onEvent({id:'circleRadius', val:10+Math.round(90*this._ampState/2.5)});
//    return;
    var base = 250;
    var max = 500;
    if (this._timeTicks++%this._sampleSize==0) {
        var ac = this.autoCorrelate(timeFloatData, this._audioContext.sampleRate);
        if (ac!=-1 && ac>=base && ac<=max) { //1700 400

            this._freqState = this._freqState*freqCoeff+ac*(1-freqCoeff);
            var val = (this._freqState-base)/(max-base)*30;
            this.onEvent({id:'timeScale', val:val});
            console.log(this._freqState + ' ' + val);

        }
    }
/*
    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j< multiplier; j++)
            magnitude += freqByteData[offset + j];
        magnitude = magnitude / multiplier;
        var magnitude2 = freqByteData[i * multiplier];
    }    
*/
}

AudioInput.prototype.seekPlayback = function(p_timeRatio) 
{
}

AudioInput.prototype.pausePlayback = function()
{
}

AudioInput.prototype.stopPlayback = function()
{
}

AudioInput.prototype.autoCorrelate = function( buf, sampleRate ) {
    var MIN_SAMPLES = 0;
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE/2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i=0;i<SIZE;i++) {
        var val = buf[i];
        rms += val*val;
    }
    rms = Math.sqrt(rms/SIZE);
    if (rms<0.01) // not enough signal
        return -1;

    var lastCorrelation=1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        var correlation = 0;

        for (var i=0; i<MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i])-(buf[i+offset]));
        }
        correlation = 1 - (correlation/MAX_SAMPLES);
        correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        if ((correlation>0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        } else if (foundGoodCorrelation) {
            // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
            // Now we need to tweak the offset - by interpolating between the values to the left and right of the
            // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
            // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
            // (anti-aliased) offset.

            // we know best_offset >=1, 
            // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
            // we can't drop into this clause until the following pass (else if).
            var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
            return sampleRate/(best_offset+(8*shift));
        }
        lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
        // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
        return sampleRate/best_offset;
    }
    return -1;
//  var best_frequency = sampleRate/best_offset;
}

module.exports = AudioInput;
