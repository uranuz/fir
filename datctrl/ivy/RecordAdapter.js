define('fir/datctrl/ivy/RecordAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/Record',
	'fir/datctrl/ivy/RecordFormatAdapter'
], function(ClassNode, Record, RecordFormatAdapter) {
return FirClass(
	function RecordAdapter(rec, fmt) {
		if( !(rec instanceof Record) ) {
			throw new Error('Expected Record');
		}
		this._rec = rec;
		if( fmt instanceof RecordFormatAdapter ) {
			this._fmt = fmt;
		} else{
			this._fmt = new RecordFormatAdapter(this._rec.getFormat());
		}
	}, ClassNode, {
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
				case 'format': return this._fmt;
				default: break;
			}
			return undefined;
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