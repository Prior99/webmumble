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
importScripts('../oggchecksum.js');

var OggPacket = function(data) {
	if(!this.parse(data)) {
		throw new Error(this.error);
	}
};

OggPacket.prototype.parse = function(data) {
	var byteBuffer = new Uint8Array(data);
	var view = new DataView(data);
	if(view.getUint8(0) !== 0x4F ||
	   view.getUint8(1) !== 0x67 ||
	   view.getUint8(2) !== 0x67 ||
	   view.getUint8(3) !== 0x53) {
		this.error = "capture_pattern did not match";
		return false;
	}
	if(view.getUint8(4) !== 0x0) {
		this.error = "unsupported stream_structure_version";
		return false;
	}
	this.headerType = {
		continuation : view.getUint8(5) & 0x1 === 1,
		beginOfStream : view.getUint8(5) & 0x2 === 2,
		endOfStream : view.getUint8(5) & 0x4 === 4
	};
	this.granulePosition = view.getUint32(10, true) * 0xFFFFFFFF | view.getUint32(6, true);
	this.serialNumber = view.getUint32(14, true);
	this.number = view.getUint32(18, true);
	this.segmentNumber = view.getUint8(26);
	this.segmentTable = byteBuffer.subarray(27, 27 + this.segmentNumber);
	this.segments = [];
	var offset = 27 + this.segmentNumber;
	for(var segment = 0; segment < this.segmentNumber; segment++) {
		var length = this.segmentTable[segment];
		this.segments.push(byteBuffer.subarray(offset, offset + length));
		offset += length;
	}
	this.checksum = view.getUint32(22, true);
	view.setUint32(22, 0);
	var expectedChecksum = OggChecksum.getChecksum(byteBuffer);
	if(expectedChecksum !== this.checksum) {
		this.error = "checksum did not match";
		return false;
	}
	return true;
};

var OggDecoder = function(obj) {
	this.number = 0;
	this.headerReceived = false;
	this.tagsReceived = false;
	this.onframe = obj.onframe || function() {};
	this.onheader = obj.onheader || function() {};
	this.onerror = obj.onerror || function() {};
};

OggDecoder.prototype._parseHeader = function(packet) {
	this.number = packet.number;
	this.headerReceived = true;
	if(packet.segmentNumber !== 1) {
		throw new Error("more than one segment in header packet");
		return;
	}
	var byteBuffer = packet.segments[0];
	//var view = new DataView(packet.segments[0].buffer);
	if(byteBuffer[0]!== 0x4F ||
	   byteBuffer[1] !== 0x70 ||
	   byteBuffer[2] !== 0x75 ||
	   byteBuffer[3] !== 0x73 ||
	   byteBuffer[4] !== 0x48 ||
	   byteBuffer[5] !== 0x65 ||
	   byteBuffer[6] !== 0x61 ||
	   byteBuffer[7] !== 0x64) {
		throw new Error("magic of header did not match codec");
		return;
	}
	if(byteBuffer[8] !== 1) {
		throw new Error("invalid version");
		return;
	}
	this.onheader({
		channels : byteBuffer[9],
		preskip : byteBuffer[10] | (byteBuffer[11] << 8),
		sampleRate : byteBuffer[12] | (byteBuffer[13] << 8) | (byteBuffer[14] << 16) | (byteBuffer[15] << 24),
		gain : byteBuffer[16] | (byteBuffer[17] << 8),
		channelMapping : byteBuffer[18],
	});
};

OggDecoder.prototype.decode = function(data) {
	try {
		var packet = new OggPacket(data);
		if(!this.headerReceived) {
			this._parseHeader(packet);
			return;
		}
		this.number++;
		if(this.number !== packet.number) {
			throw new Error("invalid packet number");
			return;
		}
		if(!this.tagsReceived) {
			this.tagsReceived = true;
			return;
		}
		while(packet.segments.length) {
			this.onframe(packet.segments.shift());
		}
	}
	catch(err) {
		console.error(err);
	}
};
