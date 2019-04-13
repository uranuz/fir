define('fir/datctrl/ivy/EnumAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/Enum'
], function(ClassNode, Enum) {
return FirClass(
	function EnumAdapter(en) {
		if( !(en instanceof Enum) ) {
			throw new Error('Expected Enum');
		}
		this._enum = en;
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
			return this._enum.getName(index);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			switch(name)
			{
				case "format": return this._enum.getFormat();
				case "value": return this._enum.getValue();
				case "name": return this._enum.getName();
				default: break;
			}
			throw new Error('Unrecognized property!');
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
