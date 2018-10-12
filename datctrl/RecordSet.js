define('fir/datctrl/RecordSet', [
	'fir/common/helpers',
	'fir/datctrl/RecordFormat',
	'fir/datctrl/Record',
	'fir/datctrl/Deserializer'
], function(helpers, RecordFormat, Record, Deserializer) {
	var RecordSet = __mixinProto(function RecordSet(opts) {
		opts = opts || {}
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
			this._d = Deserializer.deserializeRecordSet(opts.rawData, this._fmt);
		} else {
			this._d = []; //Данные (массив)
		}

		this._recIndex = 0;
		this._reindex(); //Строим индекс
	}, {
		//Возращает след. запись или null, если их больше нет
		next: function() {
			var rec = this.getRecordAt(this._recIndex);
			this._recIndex++;
			return rec;
		},
		//Возвращает true, если есть ещё записи, иначе - false
		hasNext: function() {
			return (this._recIndex < this._d.length);
		},
		//Сброс итератора на начало
		rewind: function() {
			this._recIndex = 0;
		},
		getFormat: function() {
			return this._fmt;
		},
		copyFormat: function() {
			return this._fmt.copy();
		},
		//Возвращает количество записей в наборе
		getLength: function() {
			return this._d.length;
		},
		//Возвращает запись по ключу
		getRecord: function(key) {
			if( this._indexes[key] == null )
				return null;
			else
				return this.getRecordAt( this._indexes[key] );
		},
		//Возвращает запись по порядковому номеру index
		getRecordAt: function(index) {
			if( index < this._d.length )
				return new Record({
					format: this._fmt,
					data: this._d[index]
				});
			else
				return null;
		},
		//Возвращает значение первичного ключа по порядковому номеру index
		getKey: function(index) {
			return this._d[ this._fmt.getKeyFieldIndex() ][index];
		},
		//Возвращает true, если в наборе имеется запись с ключом key, иначе - false
		hasKey: function(key) {
			if( this._indexes[key] == null )
				return false;
			else
				return true;
		},
		//Возвращает порядковый номер поля первичного ключа в наборе записей
		getKeyFieldIndex: function() {
			return this._fmt.getKeyFieldIndex();
		},
		//Добавление записи rec в набор записей
		append: function(rec) {
			if( this.getIsEmpty || this._fmt.equals(rec._fmt) )
			{
				if( this._fmt.getIsEmpty() )
					this._fmt = rec._fmt.copy();
				this._indexes[ rec.getKey() ] = this._d.length;
				this._d.push(rec._d);
			}
			else
				console.error("Формат записи не совпадает с форматом набора данных!!!");
		},
		remove: function(key) {
			var
				index = this._indexes[key];

			if( index !== undefined )
			{	this._d.splice(index, 1);
				this._reindex(index);
			}
			else
				console.error("Запись с ключом " + key + " не содержится в наборе данных!!!");
		},
		_reindex: function(startIndex) {
			var
				i = 0,
				kfi = this.getKeyFieldIndex();

			this._indexes = {};

			for( ; i < this._d.length ; i++ )
				this._indexes[ this._d[i][ kfi ] ] = i;
		},
		getIsEmpty: function() {
			return !this._d.length && this._fmt.getIsEmpty();
		},
		copy: function() {
			return new RecordSet({
				format: this._fmt.copy(),
				data: helpers.deepCopy( this._d ),
				keyFieldIndex: this._keyFieldIndex
			});
		}
	});
	return RecordSet;
});
