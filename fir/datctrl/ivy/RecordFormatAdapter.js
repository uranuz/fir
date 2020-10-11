define('fir/datctrl/ivy/RecordFormatAdapter', [
	'ivy/types/data/iface/class_node',
	'fir/datctrl/RecordFormat',
	'fir/ivy/UnwrappableNode'
], function(ClassNode, RecordFormat, UnwrappableNode) {
return FirClass(
	function RecordFormatAdapter(fmt) {
		if( !(fmt instanceof RecordFormat) ) {
			throw new Error('Expected RecordFormat');
		}

		this._fmt = fmt;
	}, ClassNode, [UnwrappableNode], {
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		__getAt__: function(index) {
			return this._fmt.getFieldFormat(index);
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