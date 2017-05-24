define('fir/controls/PlainDatePicker/PlainDatePicker', [
	'fir/controls/FirControl',
	'css!fir/controls/PlainDatePicker/PlainDatePicker'
], function(FirControl) {
	__extends(PlainDatePicker, FirControl);

	function PlainDatePicker(opts) {
		opts = opts || {};
		FirControl.call(this, opts);
	}

	return __mixinProto(PlainDatePicker, {
		rawDay: function() {
			return this._elems().filter('.e-day_field').val();
		},
		rawMonth: function() {
			return this._elems().filter('.e-month_field').val();
		},
		rawYear: function() {
			return this._elems().filter('.e-year_field').val();
		}
	});
});
