define('fir/controls/Record', [
	'fir/common/helpers',
	'fir/datctrl/RecordFormat'
], function(helpers, RecordFormat) {
	var Record = __mixinProto(function Record(opts) {
		opts = opts || {};
		if( opts.format != null && opts.fields != null ) {
			console.error('Format or fields option should be provided but not both!!! Still format is priorite option..');
		}

		if( opts.format instanceof RecordFormat ) {
			this._fmt = opts.format; //Формат записи (RecordFormat)
		} else {
			this._fmt = new RecordFormat({fields: opts.fields});
		}

		if( opts.data instanceof Array )
			this._d = opts.data;
		else
			this._d = []; //Данные (массив)
	}, {
		//Метод получения значения из записи по имени поля
		get: function(index, defaultValue) {
			var val;
			if( helpers.isUnsigned(index) )
			{	//Вдруг там массив - лучше выдать копию
				val = helpers.deepCopy( this._d[ index ] );
			}
			else
			{	//Вдруг там массив - лучше выдать копию
				val = helpers.deepCopy( this._d[ this._fmt.getIndex(index) ] );
			}
			if( val == null )
				return defaultValue;
			else
				return val;
		},
		getLength: function() {
			return this._d.length;
		},
		copyFormat: function() {
			return this._fmt.copy();
		},
		getKey: function() {
			return this._d[ this._fmt._keyFieldIndex ];
		},
		getKeyFieldIndex: function() {
			return this._fmt._keyFieldIndex;
		},
		set: function() {
			//Не используй меня. Я пустой!..
			//...или реализуй меня и используй
		},
		getIsEmpty: function() {
			return !this._d.length && this._fmt.getIsEmpty();
		},
		copy: function() {
			return new Record({
				format: this._fmt.copy(),
				data: helpers.deepCopy( this._d )
			});
		}
	});
	return Record;
});
