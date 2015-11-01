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
/**
 * Create a binary opus header based on the passed arguments.
 * @param {object} obj - Object containing the arguments to be stored in the header.
 * @param {number} obj.channels - The amount of channels in the stream.
 * @param {number} obj.sampleRate - The samplerate pf the stream in hertz.
 */
var OggOpusHeaderPacket = function(obj) {
	return new Uint8Array([
		0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64, //'OpusHead'
		0x01, //Version 1.0
		obj.channels, //Channels
		0x0, 0x0, //Preskip
		(obj.sampleRate & 0x000000FF) >> 0, //Samplerate
		(obj.sampleRate & 0x0000FF00) >> 8,
		(obj.sampleRate & 0x00FF0000) >> 16,
		(obj.sampleRate & 0xFF000000) >> 24,
		0x0, 0x0, //Gain
		0x0//Channel mapping
	]);
};

/**
 * Create a binary opus tags header.
 */
var OggOpusTagsPacket = function() {
	return new Uint8Array([
		0x4F, 0x70, 0x75, 0x73, 0x54, 0x61, 0x67, 0x73, //'OpusTags'
		6, //Length of following string
		0x62, 0x75, 0x6D, 0x62, 0x6C, 0x65, //'bumble'
		0 //Commentlength
	]);
};
/**
 * Called when a packet was generated.
 * @callback OggEncoder~PacketCallback
 * @param {ArrayBuffer} packet - A buffer containing the generated packet.
 */
/**
 * Encodes an OGG stream.
 * @constructor
 * @param {object} obj - Containing all attributes to setup the stream and transmit in the header.
 * @param {PacketCallback} obj.onpacket - Called whenever a new packet is generated.
 * @param {number} obj.channels - The amount of channels in the stream.
 * @param {number} obj.sampleRate - The samplerate pf the stream in hertz.
 */
var OggEncoder = function(obj) {
	if(obj.onpacket) {
		this.onpacket = obj.onpacket || function() { };
	}
	this.segmentTable = new Uint8Array(255);
	this.segmentData = new Uint8Array(255*255);
	// Initialize internal variables used during encoding.
	this.granule = 0; // The granule position.
	this.serialNumber = Math.floor(Math.random() * Math.pow(2, 32)); // Generate a random serial number.
	this.segmentNumber = 0; // The segment number representing the amount of segments in the current packet.
	this.dataIndex = 0; // The current offset in the data.
	this.headerType = 2; // The type of the header to send. Please refer to the OGG documentation.
	this.number = 0; // The ever-increasing packet number.
	// Encode the header packet
	this.encode(OggOpusHeaderPacket({
		channels : obj.channels,
		sampleRate : obj.sampleRate
	}));
	// Encode the tags packet
	this.encode(OggOpusTagsPacket());
};

/**
 * Call this method with the data to encapsulate in order to generate new packets.
 * @param {ArrayBuffer} data - The buffer containing the data which should be encapsulated.
 */
OggEncoder.prototype.encode = function(data) {
	this.granule += data.length; // Increase the granule position (The absolute position in the overall stream).
	for(var index = 0; index < data.length;) { // Iterate of the whole data in order to generate segments of 255 byte length.
		var length = Math.min(data.length - index, 255); // Max the size of one segment at 255 byte.
		this.segmentTable[this.segmentNumber] = length; // Store the length of the current segment at the current index in the segment table.
		this.segmentData.set(data.subarray(index, index + length), this.dataIndex); // Copy the data to the corresponding position in the segment data buffer.
		this.dataIndex += length; // Increase the position in the segment data buffer for the next packet.
		index += length; // Increase the position on the buffer for the input data.
		if(this.segmentNumber === 255) { // If 255 segments are generated, the packet is full and the packet needs to be flushed.
			this._generatePacket(); // Generate and flush a new packet.
		}
		this.segmentNumber++; // Increase the amount of segments generated.
	}
	this._generatePacket(); // All data was written. Dispatch a packet.
};

OggEncoder.prototype._generatePacket = function() {
	if(this.segmentNumber !== 0) { // Only dispatch a packet if the packet is not empty.
		var packet = this._generateBinaryPacket(); // Encode the packet.
		this.number++; // Increase amount of packets generated.
		this.onpacket(packet); // Dispatch the packet.
	}
};

OggEncoder.prototype._generateBinaryPacket = function() {
	var buffer = new ArrayBuffer(27 + this.segmentNumber + this.dataIndex); // Allocate a new buffer for the packet.
	var view = new DataView(buffer); // Create a view for the buffer to work on.
	var byteBuffer = new Uint8Array(buffer); // Create view on the buffer to work binarywise on it.
	// Write the magic 'OggS'.
	view.setUint8(0, 0x4f); // O
	view.setUint8(1, 0x67); // g
	view.setUint8(2, 0x67); // g
	view.setUint8(3, 0x53); // S
	view.setUint8(4, 0); // Version. 0 is currently (2015) the only allowed version.
	view.setUint8(5, this.headerType); //Bitmask: 1 = continuation, 2 = BOS, 4 = EOS
	// Write the granule position.
	view.setUint32(6, this.granulePosition, true); // The lower 32 bit.
	view.setUint32(10, this.granulePosition / 0xFFFFFFFF, true); // The upper 32 bit.
	view.setUint32(14, this.serialNumber, true); // Write the serial number to unique identify this stream.
	view.setUint32(18, this.number, true); // Write the current number of the packet.
	view.setUint8(26, this.segmentNumber); // Write the amount of segments in this packet.
	byteBuffer.set(this.segmentTable.subarray(0, this.segmentNumber), 27); // Write the segment table...
	byteBuffer.set(this.segmentData.subarray(0, this.dataIndex), 27 + this.segmentNumber); // ...as well as the segment data.
	view.setUint32(22, OggChecksum.getChecksum(byteBuffer),true); // In the end put the checksum in the header.
	// Reset the counters used for each packet
	this.segmentNumber = 0;
	this.dataIndex = 0;
	// The header type is 0 for all packets in the stream that are neither the first nor the last packet.
	this.headerType = 0;
	return buffer;
};
