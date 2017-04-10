define('fir.datctrl.RecordFormat', ['fir.common.helpers'], function(helpers) {
	var RecordFormat = __mixinProto(function RecordFormat(opts) {
		opts = opts || {}
		if( opts.fields instanceof Array ) {
			this._f = opts.fields;
			this._keyFieldIndex = opts.keyFieldIndex? opts.keyFieldIndex : 0;
		}
		else {
			this._f = [];
			this._keyFieldIndex = 0;
		}

		//Expected to be mapping from field index to enum format
		this._enum = opts.enumFormats || {};

		this._reindex();
	}, {
		_reindex: function() {
			var key, i;
			this._indexes = {}
			for( i = 0; i < this._f.length; i++ )
			{
				key = this._f[i].n;
				if( key != null )
					this._indexes[key] = i;
			}
		},
		//Функция расширяет текущий формат, добавляя к нему format
		extend: function(format) {
			for( var i = 0; i < format._f.length; i++ )
			{	this._f.push(format._f[i]);
				this._indexes[format.n] = format._f.length;
			}
		},
		//Получить индекс поля по имени
		getIndex: function(name) {
			return this._indexes[name];
		},
		//Получить имя поля по индексу
		getName: function(index) {
			return this._f[ index ].n;
		},
		//Получить тип поля по имени или индексу
		getType: function(index) {
			if( helpers.isUnsigned(index) )
				return this._f[ index ].t;
			else
				return this._f[ this.getFieldIndex(index) ].t;
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
		copy: function() {
			return new RecordFormat({
				fields: helpers.deepCopy( this._f ),
				keyFieldIndex: this._keyFieldIndex
			});
		}
	});
	return RecordFormat;
});
