define('fir/datctrl/ivy/RecordFormatAdapter', [
	'ivy/ClassNode',
	'fir/common/helpers',
	'fir/datctrl/RecordFormat'
], function(ClassNode, helpers, RecordFormat) {
	function RecordFormatAdapter(fmt) {
		if( !(fmt instanceof RecordFormat) ) {
			throw new Error('Expected RecordFormat');
		}

		this._fmt = fmt;
	};
	__extends(RecordFormatAdapter, ClassNode);
	return __mixinProto(RecordFormatAdapter, {
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
			return this._fmt.getRawFormat(index);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name) {
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
			throw new Error('Not implemented!');
		}
	});
});