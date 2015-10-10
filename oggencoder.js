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

var OggOpusTagsPacket = function() {
	return new Uint8Array([
		0x4F, 0x70, 0x75, 0x73, 0x54, 0x61, 0x67, 0x73, //'OpusTags'
		6, //Length of following string
		0x62, 0x75, 0x6D, 0x62, 0x6C, 0x65, //'bumble'
		0 //Commentlength
	]);
};

var OggEncoder = function(obj) {
	console.log("Oggencoder created");
	this.packets = [];
	this.number = 0;
	this.callback = obj.callback();
	this.granule = 0;
	this.serialNumber = Math.floor(Math.random() * Math.pow(2, 32));
	this.generateChecksumTable();
	this.segmentTable = new Uint8Array(255);
	this.segmentNumber = 0;
	this.segmentData = new Uint8Array(255*255);
	this.dataIndex = 0;
	this.headerType = 2;

	this.pushFrame(OggOpusHeaderPacket({
		channels : obj.channels,
		sampleRate : obj.sampleRate
	}));
	this.pushFrame(OggOpusTagsPacket());
};

OggEncoder.prototype.pushFrame = function(data) {
	console.log("Oggencoder frame pushing...");
	this.granule += data.length;
	for(var index = 0; index < data.length;) {
		var length = Math.min(data.length - index, 255);
		this.segmentTable[this.segmentNumber] = length;
		this.segmentData.set(data.subarray(index, index + length), this.dataIndex);
		this.dataIndex += length;
		this.segmentNumber++;
		index += length;
		if(this.segmentNumber === 255) {
			this.flush();
		}
	}
};

OggEncoder.prototype.flush = function() {
	if(this.segmentNumber !== 0) {
		this.pushPacket();
		this.segmentNumber = 0;
		this.dataIndex = 0;
		this.headerType = 0;
	}
};

OggEncoder.prototype.generateBinaryPacket = function() {
	var buffer = new ArrayBuffer(27 + this.segmentNumber + this.dataIndex);
	var view = new DataView(buffer); //5367674f
	var byteBuffer = new Uint8Array(buffer);
	view.setUint8(0, 0x53); //OggS
	view.setUint8(1, 0x67);
	view.setUint8(2, 0x67);
	view.setUint8(3, 0x4f);
	view.setUint8(4, 0); //Version
	view.setUint8(5, headerType); //Bitmask: 1 = continuation, 2 = BOS, 4 = EOS
	view.setUint32(6, this.granulePosition, true);
	if(this.granulePosition > 4294967296 || this.granulePosition < 0) { //If position had overflow
		view.setUint32(10, Math.floor(this.granulePosition/4294967296), true);
	}
	view.setUint32(14, this.serialNumber, true);
	view.setUint32(18, this.number, true);
	view.setUint8(26, this.segmentNumber, true);
	buffer.set(this.segmentTable.subarray(0, this.segmentNumber), 27); //Segment Table
	buffer.set(this.segmentData.subarray(0, this.dataIndex), 27 + this.segmentNumber); //Segment Data
	view.setUint32(22, this.getChecksum(byteBuffer),true);
	return buffer;
};

OggEncoder.prototype.pushPacket = function() {
	var packet = this.generateBinaryPacket();
	this.packets.push(packet);
	console.log(packet);
	this.number++;
	if(this.callback) {
		this.callback();
	}
};


OggEncoder.prototype.getChecksum = function(data) {
	var checksum = 0;
	for(var i = 0; i < data.length; i++) {
		checksum = (checksum << 8) ^ this.checksumTable[((checksum>>>24) & 0xff) ^ data[i]];
	}
	return checksum >>> 0;
};

OggEncoder.prototype.generateChecksumTable = function() {
	this.checksumTable = [];
	for(var i = 0; i < 256; i++) {
		var r = i << 24;
		for(var j = 0; j < 8; j++) {
			r = ((r & 0x80000000) != 0) ? ((r << 1) ^ 0x04c11db7) : (r << 1);
		}
		this.checksumTable[i] = (r & 0xffffffff);
	}
};
