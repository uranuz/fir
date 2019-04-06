define('fir/datctrl/EnumFormat', [
	'fir/datctrl/iface/RecordSet',
	'fir/datctrl/RecordSetMixin',
	'fir/datctrl/RecordFormat',
	'fir/common/helpers'
], function(IRecordSet, RecordSetMixin, RecordFormat, helpers) {
return FirClass(
	function EnumFormat(opts) {
		opts = opts || {};
		if( !(opts.rawData instanceof Array)  ) {
			throw new Error('Expected enum items option');
		}
		this._d = opts.rawData || [];
		this._names = {};
		this._fmt = new RecordFormat({
			fields: [
				{"n": 'value', t: "str"},
				{"n": 'name', t: "str"}
			],
			keyFieldIndex: 0
		});
		this._reindex();
	}, IRecordSet, [RecordSetMixin], {
		getName: function(value) {
			if( !this._names.hasOwnProperty(value) ) {
				throw new Error('No item with specified value in enum');
			}
			if( this._names[value] < 2 ) {
				throw new Error('Enum format has values has no names');
			}
			return this._names[value][1];
		},
		getValue: function(name) {
			var i = 0, curItem;
			for( ; i < this._d.length; ++i ) {
				curItem = this._d[i];
				if( curItem[1] === name )
					return curItem[0];
			}
			throw new Error('No item with specified name in enum');
		},
		getStr: function(value) {
			return this.getName(value);
		},
		_reindex: function() {
			this._names = {};
			var i = 0, curItem;
			for( ; i < this._d.length; ++i ) {
				curItem = this._d[i];
				this._names[curItem[0]] = [i, curItem[1]];
			}
		},
		//Возвращает запись по ключу
		getRecord: function(key) {
			if( this._names[key] == null )
				return null;
			else
				return this.getRecordAt( this._names[key][0] );
		},
		//Возвращает true, если в наборе имеется запись с ключом key, иначе - false
		hasKey: function(key) {
			if( this._names[key] == null )
				return false;
			else
				return true;
		},
		//Добавление записи rec в набор записей
		append: function(rec) {
			throw new Error('Not implemented yet!');
		},
		remove: function(key) {
			throw new Error('Not implemented yet!');
		},
		copy: function() {
			return new EnumFormat({
				format: this._fmt.copy(),
				rawData: helpers.deepCopy(this._d)
			});
		}
});
});
