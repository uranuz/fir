define('fir/datctrl/FieldFormat', [
	'fir/datctrl/iface/FieldFormat'
], function(IFieldFormat) {
return FirClass(
	function FieldFormat(opts) {
		if( typeof(opts.n) !== 'string' && !(opts.n instanceof String) ) {
			throw new Error('Expected string as field format name');
		}
		if( typeof(opts.t) !== 'string' && !(opts.t instanceof String) ) {
			throw new Error('Expected string as field type');
		}
		this._n = opts.n;
		this._t = opts.t;
	}, IFieldFormat, {
		getFieldName: function() {
			return this._n;
		},
		getType: function() {
			return this._t;
		}
	});
});
