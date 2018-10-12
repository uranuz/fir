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

		this._namesMapping = {};
		var fmt = this._rs.getFormat();
		for( var i = 0; i < fmt.getLength(); ++i ) {
			this._namesMapping[fmt.getName(i)] = i;
		}
	};
	__extends(RecordSetAdapter, ClassNode);
	return __mixinProto(RecordSetAdapter, {
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
				case 'format': return new RecordFormatAdapter(this._rec.getFormat());
				case 'namesMapping': return this._namesMapping;
				default: throw new Error('Property is undefined!');
			}
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		setAttr: function(value, name) {
			throw new Error('Not implemented!');
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		serialize: function() {
			throw new Error('Not implemented!');
		},
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			return this._rs.getLength();
		}
	});
});