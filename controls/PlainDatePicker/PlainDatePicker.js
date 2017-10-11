define('fir/controls/PlainDatePicker/PlainDatePicker', [
	'fir/controls/FirControl',
	'css!fir/controls/PlainDatePicker/PlainDatePicker'
], function(FirControl) {
	__extends(PlainDatePicker, FirControl);

	function PlainDatePicker(opts) {
		FirControl.call(this, opts);
	}

	return __mixinProto(PlainDatePicker, {
		rawDay: function() {
			return this._elems('dayField').val();
		},
		rawMonth: function() {
			return this._elems('monthField').val();
		},
		rawYear: function() {
			return this._elems('yearField').val();
		}
	});
});
