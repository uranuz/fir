define('fir/datctrl/ivy/RecordAdapter', [
	'ivy/types/data/base_class_node',
	'fir/datctrl/Record',
	'fir/datctrl/ivy/RecordFormatAdapter',
	'fir/datctrl/ivy/EnumAdapter',
	'fir/datctrl/Enum',
	'ivy/types/data/datetime',
	'fir/ivy/UnwrappableNode'
], function(
	BaseClassNode,
	Record,
	RecordFormatAdapter,
	EnumAdapter,
	Enum,
	IvyDateTime,
	UnwrappableNode
) {
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
	}, BaseClassNode, [UnwrappableNode], {
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		__getAt__: function(index) {
			var val = this._rec.get(index);
			if( val instanceof Enum ) {
				return new EnumAdapter(val);
			}
			if( val instanceof Date ) {
				return new IvyDateTime(val);
			}
			return val;
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		__getAttr__: function(name) {
			switch(name) {
				case 'format': return this._fmt;
				default: break;
			}
			return this.__getAt__(name);
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		__serialize__: function() {
			return this._rec.toStdJSON();
		},
		/** Analogue to size_t length() @property; in D impl */
		length: firProperty(function() {
			return this._rec.length;
		}),
		unwrap: function() {
			return this._rec;
		}
});
});