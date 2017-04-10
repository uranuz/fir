define('fir.controls.CheckBoxList', ['fir.controls.ITEMControl'], function(ITEMControl) {
	__extends(PlainDatePicker, _super);

	function PlainDatePicker(opts)
	{
		opts = opts || {};
		opts.controlTypeName = 'webtank.ui.PlainDatePicker';
		_super.call(this, opts);
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
