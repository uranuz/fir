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
	function RecordSetAdapter(rs) {
		if( !(rs instanceof RecordSet) ) {
			throw new Error('Expected RecordSet');
		}
		this._rs = rs;
	};
	__extends(RecordSetAdapter, ClassNode);
	return __mixinProto(RecordSetAdapter, {
		/** Analogue to IDataNodeRange opSlice(); in D impl */
		range: function() {
			return new RecordSetRange(this);
		},
		/** Analogue to IClassNode opSlice(size_t, size_t); in D impl */
		slice: function(start, end) {
			throw new Error('Not implemented!');
		},
		/** Analogue to:
		 * TDataNode opIndex(string);
		 * TDataNode opIndex(size_t);
		 * in D impl */
		at: function(index) {
			if( typeof(index) === 'number' ) {
				return this._rs.getRecordAt(index);
			} else {
				return this._rs.getRecord(index);
			}
		},
		/** Analogue to TDataNode __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name) {
				case 'format': new RecordFormatAdapter(this._rec.getFormat()); break;
				case 'namesMapping':
					throw new Error('Not implemented!');
				break;
				default: throw new Error('Property is undefined!');
			}
		},
		/** Analogue to void __setAttr__(TDataNode, string); in D impl */
		setAttr: function(value, name) {
			throw new Error('Not implemented!');
		},
		/** Analogue to TDataNode __serialize__(); in D impl */
		serialize: function() {
			throw new Error('Not implemented!');
		},
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			return this._rs.getLength();
		}
	});
});