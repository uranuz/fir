define('fir/datctrl/ivy/RecordFormatAdapter', [
	'ivy/ClassNode'
], function(ClassNode) {
	function RecordFormatAdapter(rec) {
		this._rec = rec;
	};
	__extends(RecordFormatAdapter, ClassNode);
	return __mixinProto(RecordFormatAdapter, {
		/** Analogue to IDataNodeRange opSlice(); in D impl */
		range: function() {
			throw new Error('Not implemented!');
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
			return this._rec.get(index);
		},
		/** Analogue to TDataNode __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name) {
				default: throw new Error('Property is undefined!');;
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
			throw new Error('Not implemented!');
		}
	});
});