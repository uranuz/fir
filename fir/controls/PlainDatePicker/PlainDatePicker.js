define('fir/controls/PlainDatePicker/PlainDatePicker', [
	'fir/controls/FirControl',
	'fir/controls/PlainDatePicker/PlainDatePicker.scss'
], function(FirControl) {
return FirClass(
	function PlainDatePicker(opts) {
		this.superproto.constructor.call(this, opts);
		var validation = this.getChildByName(this.instanceName() + 'Validation');
		validation.addValidators([
			{
				elem: 'dayField',
				fn: this._checkDayField.bind(this)
			}, {
				elem: 'yearField',
				fn: this._checkYearField.bind(this)
			}
		]);
	}, FirControl, {
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
				return this._dayInvalidMessage;
			} else if( day < 1 || day > 31 ) {
				return this._dayInvalidMessage;
			}
		},
		_checkYearField: function(vld, elem) {
			var
				yearText = this.rawYear(),
				year = parseInt(yearText, 10);

			if( yearText.length && (isNaN(year) || String(year) !== yearText) ) {
				return this._yearInvalidMessage;
			}
		},
		_parseNum: function(val) {
			var val = parseInt(val, 10);
			return isNaN(val)? null: val;
		},
		getDay: function() {
			return this._parseNum(this.rawDay());
		},
		getMonth: function() {
			return this._parseNum(this.rawMonth());
		},
		getYear: function() {
			return this._parseNum(this.rawYear());
		},
		getDate: function() {
			var dd = this.getDay(), mm = this.getMonth(), yy = this.getYear();
			if( dd == null || mm == null || yy == null ) {
				return null;
			}
			// Control starts dates from 1, but JS starts from 0
			return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
		},
		getOptDate: function() {
			var
				year = this.getYear(),
				month = this.getMonth(),
				day = this.getDay();
			if( !year && !month && !day ) {
				return null; // Date is completely empty
			}
			var res = {};
			// Add parts of date that are not empty
			if( year ) {
				res.year = year;
			}
			if( month ) {
				res.month = month;
			}
			if( day ) {
				res.day = day;
			}
			return res;
		}
});
});
