define('fir/datctrl/ivy/FieldFormatAdapter', [
	'ivy/types/data/base_class_node',
	'fir/datctrl/FieldFormat',
	'fir/ivy/UnwrappableNode'
], function(BaseClassNode, FieldFormat, UnwrappableNode) {
return FirClass(
	function FieldFormatAdapter(fmt) {
		if( !(fmt instanceof FieldFormat) ) {
			throw new Error('Expected FieldFormat');
		}
		this._fmt = fmt;
	}, BaseClassNode, [UnwrappableNode], {
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		__getAt__: function(index) {
			return this._fmt.getName(index);
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		__serialize__: function() {
			return this._fmt.toStdJSON();
		},
		unwrap: function() {
			return this._fmt;
		}
});
});
