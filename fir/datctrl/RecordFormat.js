define('fir/datctrl/RecordFormat', [
	'fir/datctrl/iface/RecordFormat',
	'fir/datctrl/iface/FieldFormat',
	'fir/common/helpers',
	'fir/datctrl/Deserializer'
], function(
	IRecordFormat,
	IFieldFormat,
	helpers,
	Deserializer
) {
var mod = FirClass(
	function RecordFormat(opts) {
		opts = opts || {}
		if( opts.fields instanceof Array ) {
			// Check that we got correct arguments
			for( var i = 0; i < opts.fields.length; ++i ) {
				if( !opts.fields[i].isInstanceOf(IFieldFormat) ) {
					throw new Error('Expected instance of IFieldFormat or EnumFormat');
				}
			}
			this._f = opts.fields;
		} else if(opts.rawFields instanceof Array) {
			this._f = Deserializer.deserializeRecordFormatFields(opts.rawFields);
		} else {
			this._f = [];
		}

		if( opts.keyFieldIndex == null || typeof(opts.keyFieldIndex) == 'number' || opts.keyFieldIndex instanceof Number ) {
			this._keyFieldIndex = opts.keyFieldIndex || 0;
		} else {
			throw new Error('Key field index must be integer');
		}

		this._reindex();
	}, IRecordFormat, {
		_reindex: function() {
			var key, i;
			this._indexes = {}
			for( i = 0; i < this._f.length; i++ ) {
				key = this._f[i].getFieldName();
				if( key != null )
					this._indexes[key] = i;
			}
		},
		//Функция расширяет текущий формат, добавляя к нему format
		extend: function(format) {
			for( var i = 0; i < format._f.length; i++ ) {
				var fmt = format._f[i];
				this._f.push(fmt);
				this._indexes[fmt.getFieldName()] = format._f.length;
			}
		},
		//Получить индекс поля по имени
		getIndex: function(name) {
			if( !this._indexes.hasOwnProperty(name) ) {
				throw new Error('No field with name in format');
			}
			return this._indexes[name];
		},
		//Получить имя поля по индексу
		getName: function(index) {
			return this.getFieldFormat(index).getFieldName();
		},
		getFieldFormat: function(index) {
			if( helpers.isUnsigned(index) ) {
				if( index >= this._f.length ) {
					throw new Error('No field by index in format');
				}
				return this._f[index];
			} else {
				return this._f[this.getIndex(index)];
			}
		},
		getKeyFieldIndex: function() {
			return this._keyFieldIndex;
		},
		equals: function(format) {
			return this._f.length === format._f.length;
		},
		getIsEmpty: function() {
			return !this._f.length;
		},
		_copyFields: function() {
			var res = [];
			for( var i = 0; i < this._f.length; ++i ) {
				res.push(this._f[i].copy());
			}
			return res;
		},
		copy: function() {
			return new mod({
				fields: this._copyFields(),
				keyFieldIndex: this._keyFieldIndex
			});
		},
		getLength: function() {
			return this._f.length;
		},
		toStdJSON: function() {
			var items = [];
			for( var i = 0; i < this._f.length; ++i ) {
				items.push(this._f[i].toStdJSON());
			}
			return {
				f: items,
				kfi: this._keyFieldIndex
			};
		}
});
return mod;
});
