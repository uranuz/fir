define('fir/datctrl/EnumItem', [
	'fir/datctrl/iface/Record',
	'fir/common/helpers'
], function(IRecord, helpers) {
var mod = FirClass(
	function EnumItem(value, name) {
		if( value === undefined ) {
			throw new Error('Value should be defined for enum value');
		}
		this._v = value;
		if( name !== undefined ) {
			this._n = name;
		}
	}, IRecord, {
		get: function(index, defaultValue) {
			var val;
			if( helpers.isUnsigned(index) ) {
				if( index === 0 ) {
					val = this._v;
				} else if( index === 1 && typeof(this._n) !== undefined ) {
					val = this._n;
				} else {
					throw new Error('Enum item index is out of bounds');
				}
			} else {
				if( index === 'value' ) {
					val = this._v;
				} else if( index === 'name' && typeof(this._n) !== undefined ) {
					val = this._n;
				} else {
					throw new Error('Unexpected enum item field');
				}
			}

			if( val == null && typeof(defaultValue) !== 'undefined' ) {
				return defaultValue;
			} else {
				return val;
			}
		},

		getLength: function() {
			return this._n === undefined? 1: 2;
		},

		getFormat: function() {
			throw new Error('Not implemented yet!');
		},

		getKey: function() {
			return this._v;
		},

		set: function(index, value) {
			throw new Error('Not implemented yet!');
		},

		copy: function() {
			return new mod(this._v, this._n);
		},

		toStdJSON: function() {
			return (typeof(this._n) === 'undefined'? [this._v]: [this._v, this._n]);
		}
});
return mod;
});
