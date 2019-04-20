define('fir/datctrl/ivy/RecordSetAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/RecordSet',
	'fir/datctrl/ivy/RecordSetRange',
	'fir/datctrl/ivy/RecordFormatAdapter'
], function(
	ClassNode,
	RecordSet,
	RecordSetRange,
	RecordFormatAdapter
) {
return FirClass(
	function RecordSetAdapter(rs) {
		if( !(rs instanceof RecordSet) ) {
			throw new Error('Expected RecordSet');
		}
		this._rs = rs;
		this._fmt = new RecordFormatAdapter(this._rs.getFormat());
	}, ClassNode, {
		/** Analogue to IvyNodeRange opSlice(); in D impl */
		range: function() {
			return new RecordSetRange(this);
		},
		/** Analogue to IClassNode opSlice(size_t, size_t); in D impl */
		slice: function(start, end) {
			throw new Error('Not implemented!');
		},
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		at: function(index) {
			if( typeof(index) === 'number' ) {
				return this._rs.getRecordAt(index);
			} else {
				return this._rs.getRecord(index);
			}
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name) {
				case 'format': return this._fmt;
				default: throw new Error('Property is undefined!');
			}
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		setAttr: function(value, name) {
			throw new Error('Not implemented!');
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		serialize: function() {
			return this._rs.toStdJSON();
		},
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			return this._rs.getLength();
		}
});
});