var OggChecksum = {
	checksumTable : [],
	getChecksum : function(data) {
		var checksum = 0;
		for(var i = 0; i < data.length; i++) {
			checksum = (checksum << 8) ^ this.checksumTable[((checksum>>>24) & 0xff) ^ data[i]];
		}
		return checksum >>> 0;
	}
};

(function() {
	for(var i = 0; i < 256; i++) {
		var r = i << 24;
		for(var j = 0; j < 8; j++) {
			r = ((r & 0x80000000) != 0) ? ((r << 1) ^ 0x04c11db7) : (r << 1);
		}
		OggChecksum.checksumTable[i] = (r & 0xffffffff);
	}
})();
