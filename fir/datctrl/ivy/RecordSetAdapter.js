define('fir/datctrl/ivy/RecordSetAdapter', [
	'ivy/types/data/base_class_node',
	'fir/datctrl/RecordSet',
	'fir/datctrl/ivy/RecordSetRange',
	'fir/datctrl/ivy/RecordFormatAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/ivy/UnwrappableNode'
], function(
	BaseClassNode,
	RecordSet,
	RecordSetRange,
	RecordFormatAdapter,
	RecordAdapter,
	UnwrappableNode
) {
return FirClass(
	function RecordSetAdapter(rs) {
		if( !(rs instanceof RecordSet) ) {
			throw new Error('Expected RecordSet');
		}
		this._rs = rs;
		this._fmt = new RecordFormatAdapter(this._rs.getFormat());
	}, BaseClassNode, [UnwrappableNode], {
		/** Analogue to IvyNodeRange opSlice(); in D impl */
		__range__: function() {
			return new RecordSetRange(this);
		},
		/** Analogue to:
		 * IvyData opIndex(string);
		 * IvyData opIndex(size_t);
		 * in D impl */
		__getAt__: function(index) {
			if( typeof(index) !== 'number' ) {
				throw new Error('Expected integer as record index');
			}
			return new RecordAdapter(this._rs.getRecordAt(index), this._fmt);
		},
		/** Analogue to IvyData __getAttr__(string); in D impl */
		__getAttr__: function(name) {
			switch(name) {
				case 'format': return this._fmt;
				default: throw new Error('Property is undefined!');
			}
		},
		/** Analogue to IvyData __serialize__(); in D impl */
		__serialize__: function() {
			return this._rs.toStdJSON();
		},
		/** Analogue to size_t length() @property; in D impl */
		length: firProperty(function() {
			return this._rs.length;
		}),
		unwrap: function(interp) {
			return this._rs;
		}
});
});