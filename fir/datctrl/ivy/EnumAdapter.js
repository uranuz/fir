define('fir/datctrl/ivy/EnumAdapter', [
	'ivy/types/data/base_class_node',
	'fir/datctrl/Enum',
	'fir/ivy/UnwrappableNode'
], function(BaseClassNode, Enum, UnwrappableNode) {
return FirClass(
	function EnumAdapter(en) {
		if( !(en instanceof Enum) ) {
			throw new Error('Expected Enum');
		}
		this._enum = en;
	}, BaseClassNode, [UnwrappableNode], {
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		__getAt__: function(index) {
			return this._enum.getName(index);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		__getAttr__: function(name) {
			switch(name)
			{
				case "format": return this._enum.getFormat();
				case "value": return this._enum.getValue();
				case "name": return this._enum.getName();
				default: break;
			}
			throw new Error('Unrecognized property!');
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		__serialize__: function() {
			return this._enum.toStdJSON();
		},
		unwrap: function() {
			return this._enum;
		}
});
});
