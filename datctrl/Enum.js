define('fir/datctrl/Enum', [
	'fir/datctrl/EnumFormat'
], function(EnumFormat) {
var mod = FirClass(
	function Enum(opts) {
		if( opts.format instanceof EnumFormat ) {
			this._fmt = opts.format; //Формат перечисления (EnumFormat)
		} else if( opts.rawData instanceof Array ) {
			this._fmt = new EnumFormat(opts);
		} else {
			throw new Error('Expected EnumFormat or list of items');
		}

		if( !opts.hasOwnProperty('value') ) {
			throw new Error('Expected value option');
		}
		if( this._fmt.getName(opts.value) === undefined ) {
			throw new Error('Incorrect enum value');
		}

		this._value = opts.value;
	}, {
		getName: function() {
			return this._fmt.getName(this._value);
		},
		getValue: function() {
			return this._value;
		},
		getStr: function() {
			return this.getName();
		},
		getFormat: function() {
			return this._fmt;
		},
		toStdJSON: function() {
			var res = this._fmt.toStdJSON();
			res.d = this._value;
			return res;
		},
		copy: function() {
			return new mod({
				format: this._fmt.copy(),
				value: this._value
			})
		}
});
return mod;
});
