define('fir/controls/PlainDatePicker/PlainDatePicker', [
	'fir/controls/FirControl',
	'fir/controls/Mixins/Validation/Validation',
	'css!fir/controls/PlainDatePicker/PlainDatePicker'
], function(FirControl, Validation) {
	__extends(PlainDatePicker, FirControl);

	function PlainDatePicker(opts) {
		FirControl.call(this, opts);
		this._validators = [
			{ elem: 'dayField', fn: this._checkDayField.bind(this) },
			{ elem: 'yearField', fn: this._checkYearField.bind(this) }
		];
		this._opts = opts;
		this.initValidation();
	}

	var pdp = __mixinProto(PlainDatePicker, {
		rawDay: function() {
			return this._elems('dayField').val();
		},
		rawMonth: function() {
			return this._elems('monthField').val();
		},
		rawYear: function() {
			return this._elems('yearField').val();
		},
		_checkDayField: function(vld, elem) {
			var
				dayText = this.rawDay(),
				day = parseInt(dayText, 10);
		
			if( dayText.length && (isNaN(day) || String(day) !== dayText) ) {
				return this._opts.dayInvalidMessage;
			} else if( day < 1 || day > 31 ) {
				return this._opts.dayInvalidMessage;
			}
		},
		_checkYearField: function(vld, elem) {
			var
				yearText = this.rawYear(),
				year = parseInt(yearText, 10);

			if( yearText.length && (isNaN(year) || String(year) !== yearText) ) {
				return this._opts.yearInvalidMessage;
			}
		}
	});
	return __mixinProto(pdp, Validation);
});
