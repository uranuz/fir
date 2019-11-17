define('fir/datctrl/ivy/FieldFormatAdapter', [
	'ivy/ClassNode',
	'fir/datctrl/FieldFormat',
	'fir/ivy/UnwrappableNode'
], function(ClassNode, FieldFormat, UnwrappableNode) {
return FirClass(
	function FieldFormatAdapter(fmt) {
		if( !(fmt instanceof FieldFormat) ) {
			throw new Error('Expected FieldFormat');
		}
		this._fmt = fmt;
	}, ClassNode, [UnwrappableNode], {
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
			return this._fmt.getName(index);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		getAttr: function(name) {
			throw new Error('Not implemented!');
		},
		/** Analogue to void __setAttr__(IvyData, string); in D impl */
		setAttr: function(value, name) {
			throw new Error('Not implemented!');
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		serialize: function() {
			return this._fmt.toStdJSON();
		},
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			throw new Error('Not implemented!');
		},
		unwrap: function() {
			return this._fmt;
		}
});
});
