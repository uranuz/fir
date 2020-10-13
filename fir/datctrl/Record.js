define('fir/datctrl/Record', [
	'fir/datctrl/iface/Record',
	'fir/common/helpers',
	'fir/datctrl/Deserializer',
	'fir/datctrl/RecordFormat'
], function(
	IRecord,
	helpers,
	Deserializer,
	RecordFormat
) {
var mod = FirClass(
	function Record(opts) {
		opts = opts || {};
		if( opts.format != null && opts.fields != null ) {
			console.error('Format or fields option should be provided but not both!!! Still format is priorite option..');
		}

		if( opts.format instanceof RecordFormat ) {
			this._fmt = opts.format; //Формат записи (RecordFormat)
		} else {
			this._fmt = new RecordFormat({fields: opts.fields});
		}

		if( opts.data instanceof Array ) {
			this._d = opts.data;
		} else if( opts.rawData instanceof Array ) {
			this._d = Deserializer.deserializeRecord(opts.rawData, this._fmt);
		} else {
			this._d = []; //Данные (массив)
		}
	}, IRecord, {
		//Метод получения значения из записи по имени поля
		get: function(index, defaultValue) {
			var val;
			if( helpers.isUnsigned(index) ) {
				val = this._d[index];
			} else {
				val = this._d[this._fmt.getIndex(index)];
			}
			if( val == null && typeof(defaultValue) !== 'undefined' ) {
				return defaultValue;
			} else {
				return val;
			}
		},
		length: firProperty(function() {
			return this._d.length;
		}),
		getFormat: function() {
			return this._fmt;
		},
		getKey: function() {
			return this._d[ this._fmt._keyFieldIndex ];
		},
		set: function(field, value) {
			if( typeof(field) === 'string' || field instanceof String ) {
				this._setImpl(field, value);
			} else if( (field instanceof Object) && value == null ) {
				this._setMass(field);
			}
		},
		_setImpl: function(field, value) {
			var index = this._fmt.getIndex(field);
			if( typeof(value) === 'undefined' ) {
				return; // If value is undefined then we treat it as there is not changes needed
			}
			// TODO: Add typechecking
			this._d[index] = value;
		},
		_setMass: function(obj) {
			for( var field in obj ) {
				if( !obj.hasOwnProperty(field) ) {
					continue;
				}
				this._setImpl(field, obj[field]);
			}
		},
		_copyRecordData: function() {
			var items = [];
			for( var i = 0; i < this._d.length; ++i ) {
				var val = this._d[i];
				if( val && (val instanceof Object) && typeof(val.copy) === 'function' ) {
					items.push(value.copy());
				} else {
					items.push(helpers.deepCopy(val));
				}
			}
			return items;
		},
		copy: function() {
			return new mod({
				format: this._fmt.copy(),
				data: this._copyRecordData()
			});
		},
		recordDataToJSON: function() {
			var items = [];
			for( var i = 0; i < this._d.length; ++i ) {
				var val = this._d[i];
				if( val && (val instanceof Object) && typeof(val.getValue) === 'function' ) {
					items.push(val.getValue());
				} else {
					items.push(val);
				}
			}
			return items;
		},
		toStdJSON: function() {
			var res = this._fmt.toStdJSON();
			res.d = this.recordDataToJSON();
			res.t = 'record';
			return res;
		},
		toObject: function() {
			var res = {};
			for( var i = 0; i < this._fmt.length; ++i ) {
				var field = this._fmt.getName(i);
				res[field] = this.get(i);
			}
			return res;
		}
});
return mod;
});
