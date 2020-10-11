define('fir/datctrl/ivy/EnumFormatAdapter', [
	'ivy/types/data/iface/class_node',
	'fir/datctrl/EnumFormat',
	'fir/ivy/UnwrappableNode'
], function(ClassNode, EnumFormat, UnwrappableNode) {
return FirClass(
	function EnumFormatAdapter(fmt) {
		if( !(fmt instanceof EnumFormat) ) {
			throw new Error('Expected EnumFormat');
		}
		this._fmt = fmt;
	}, ClassNode, [UnwrappableNode], {
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
		/** Analogue to size_t length() @property; in D impl */
		getLength: function() {
			return this._fmt.getLength();
		},
		unwrap: function() {
			return this._fmt;
		}
});
});
