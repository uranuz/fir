define('fir/datctrl/ivy/RecordAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/Record',
	'fir/datctrl/ivy/RecordFormatAdapter'
], function(ClassNode, Record, RecordFormatAdapter) {
	function RecordAdapter(rec) {
		if( !(rec instanceof Record) ) {
			throw new Error('Expected Record');
		}
		this._rec = rec;
	};
	__extends(RecordAdapter, ClassNode);
	return __mixinProto(RecordAdapter, {
		/** Analogue to IvyNodeRange opSlice(); in D impl */
		range: function() {
			throw new Error('Not implemented!');
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
			return this._rec.get(index);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name) {
				case 'format': new RecordFormatAdapter(this._rec.getFormat()); break;
				case 'namesMapping':
					throw new Error('Not implemented!');
				break;
				default: throw new Error('Property is undefined!');;
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
			return this._rec.getLength();
		}
	});
});