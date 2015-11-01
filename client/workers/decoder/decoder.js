/*
 *  This file is part of Bumble, a browser based client for mumble.
 *
 *  Bumble is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Bumble is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Bumble. If not, see <http://www.gnu.org/licenses/>.
 */
importScripts('oggdecoder.js', 'opusdecoder.js', '../resampler.js');

var Decoder = function(e) {
	this.channels = 1;
	this.outputSampleRate = e.outputSampleRate;

	this.onpcm = e.onpcm || function() {};
	this.onerror = e.onerror || function() {};

	this.oggDecoder = new OggDecoder({
		onframe : this._onframe.bind(this),
		onerror : this.onerror,
		onheader : this._onheader.bind(this)
	});
};

Decoder.prototype._onheader = function(format) {
	console.log(format);
	this.opusDecoder = new OpusDecoder({
		sampleRate : format.sampleRate,
		channels : format.channels,
		onerror : this.onerror,
		onpcm : this._onpcm.bind(this)
	});
	this.resampler = new Resampler({
		resampledRate : this.outputSampleRate,
		originalSampleRate : format.sampleRate,
		numberOfChannels : this.channels
	});
};
Decoder.prototype._onpcm = function(data) {
	var resampled = this.resampler.resample(data, 0);
	this.onpcm(resampled);
};

Decoder.prototype._onframe = function(frame) {
	this.opusDecoder.decode(frame);
};

Decoder.prototype.decode = function(data) {
	this.oggDecoder.decode(data);
};

this.onpcm = function(data) {
	this.postMessage({
		type : 'pcm',
		pcm : data
	});
};

this.onerror = function(err) {
	this.postMessage({
		type : 'error',
		error : err
	});
};

this.onmessage = function(e) {
	var obj = e.data;
	if(obj.command == 'init') { // Initialize a new encoder on init.
		this.decoder = new Decoder({
			outputSampleRate : obj.outputSampleRate,
			inputSampleRate : obj.inputSampleRate,
			onerror : this.onerror.bind(this),
			onpcm : this.onpcm.bind(this)
		}, this);
	}
	else if(obj.command == 'decode') {
		this.decoder.decode(obj.data); // Encode a buffer of raw pcm audio.
	}
}.bind(this);
