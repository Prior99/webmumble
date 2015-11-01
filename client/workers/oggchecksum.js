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

/**
 * Creates checksums as specified in the OGG standard here: http://www.xiph.org/ogg/doc/framing.html
 */
var OggChecksum = {
	checksumTable : [],
	/**
	 * Calculates the checksum for a single buffer.
	 * @param {ArrayBuffer} data - Calculate the checksum for this buffer.
	 */
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
