define('fir/datctrl/ivy/RecordSetAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/RecordSet',
	'fir/datctrl/ivy/RecordSetRange',
	'fir/datctrl/ivy/RecordFormatAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/ivy/UnwrappableNode'
], function(
	ClassNode,
	RecordSet,
	RecordSetRange,
	RecordFormatAdapter,
	RecordAdapter,
	UnwrappableNode
) {
return FirClass(
	function RecordSetAdapter(rs) {
		if( !(rs instanceof RecordSet) ) {
			throw new Error('Expected RecordSet');
		}
		this._rs = rs;
		this._fmt = new RecordFormatAdapter(this._rs.getFormat());
	}, ClassNode, [UnwrappableNode], {
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
			if( typeof(index) !== 'number' ) {
				throw new Error('Expected integer as record index');
			}
			return new RecordAdapter(this._rs.getRecordAt(index), this._fmt);
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
		},
		unwrap: function(interp) {
			return this._rs;
		}
});
});