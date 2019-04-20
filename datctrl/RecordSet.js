define('fir/datctrl/RecordSet', [
	'fir/datctrl/iface/RecordSet',
	'fir/datctrl/RecordSetMixin',
	'fir/datctrl/RecordFormat',
	'fir/datctrl/Deserializer'
], function(
	IRecordSet,
	RecordSetMixin,
	RecordFormat,
	Deserializer
) {
	"use strict";
var mod = FirClass(
	function RecordSet(opts) {
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

		this._reindex(); //Строим индекс
	}, IRecordSet, [RecordSetMixin], {
		//Возвращает запись по ключу
		getRecord: function(key) {
			if( this._indexes[key] == null )
				return null;
			else
				return this.getRecordAt(this._indexes[key]);
		},
		//Возвращает true, если в наборе имеется запись с ключом key, иначе - false
		hasKey: function(key) {
			if( this._indexes[key] == null )
				return false;
			else
				return true;
		},
		//Добавление записи rec в набор записей
		append: function(rec) {
			if( this.getLength() > 0 || this._fmt.equals(rec._fmt) )
			{
				if( this._fmt.getLength() > 0 )
					this._fmt = rec._fmt.copy();
				this._indexes[rec.getKey()] = this._d.length;
				this._d.push(rec);
			}
			else
				console.error("Формат записи не совпадает с форматом набора данных!!!");
		},
		remove: function(key) {
			var
				index = this._indexes[key];

			if( index !== undefined ) {
				this._d.splice(index, 1);
				this._reindex(index);
			}
			else
				console.error("Запись с ключом " + key + " не содержится в наборе данных!!!");
		},
		_reindex: function(startIndex) {
			var
				i = 0,
				kfi = this._fmt.getKeyFieldIndex();

			this._indexes = {};

			for( ; i < this._d.length ; i++ ) {
				this._indexes[this._d[i].get(kfi)] = i;
			}
		},
		_copyRecords: function() {
			var res = [];
			for( var i = 0; i < this._d.length; ++i ) {
				res.push(this._d[i].copy());
			}
			return res;
		},
		copy: function() {
			return new mod({
				format: this._fmt.copy(),
				data: this._copyRecords()
			});
		},
		toStdJSON: function() {
			var
				res = this._fmt.toStdJSON(),
				items = [];
			for( var i = 0; i < this._d.length; ++i ) {
				items.push(this._d[i].recordDataToJSON());
			}
			res.d = items;
			res.t = 'recordset';
			return res;
		}
});
return mod;
});
