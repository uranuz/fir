define('fir/datctrl/EnumFormat', [
	'fir/datctrl/iface/RecordSet',
	'fir/datctrl/RecordSetMixin',
	'fir/datctrl/iface/FieldFormat',
	'fir/datctrl/Deserializer',
	'fir/datctrl/EnumItem'
], function(
	IRecordSet,
	RecordSetMixin,
	IFieldFormat,
	Deserializer,
	EnumItem
) {
var mod = FirClass(
	function EnumFormat(opts) {
		opts = opts || {};
		if( opts.rawData instanceof Array  ) {
			this._d = [];
			for( var i = 0; i < opts.rawData.length; ++i ) {
				var rawItem = opts.rawData[i];
				if( !(rawItem instanceof Array) ) {
					throw new Error('Expected array as enum item raw data');
				}
				if( rawItem.length === 1 ) {
					this._d.push(new EnumItem(rawItem[0]));
				} else if( rawItem.length === 2 ) {
					this._d.push(new EnumItem(rawItem[0], rawItem[1]));
				} else {
					throw new Error('Expected array of 1 or 2 elements as enum item raw data');
				}
			}
		} else if( opts.data instanceof Array ) {
			this._d = opts.data;
		} else {
			throw new Error('Expected enum items option');
		}
		if( opts.name != null && typeof(opts.name) !== 'string' && !(opts.name instanceof String) ) {
			throw new Error('Expected string of null as enum field name');
		}
		
		this._n = opts.name;
		this._names = {};
		this._fmt = Deserializer.deserializeRecordFormat({
			f: [
				{n: 'value', t: "str"},
				{n: 'name', t: "str"}
			],
			kfi: 0
		});
		this._reindex();
	}, IRecordSet, [RecordSetMixin, IFieldFormat], {
		getFieldName: function() {
			return this._n;
		},
		getType: function() {
			return 'enum';
		},
		getName: function(value) {
			if( !this._names.hasOwnProperty(value) && value == null ) {
				return null; // Special case for empty value
			}
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
				if( curItem.get('name') === name )
					return curItem.geKey();
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
				this._names[curItem.getKey()] = [i, curItem.get('name')];
			}
		},
		getRecord: function(key) {
			return this._names[key] == null? null: this.getRecordAt(this._names[key][0]);
		},
		hasKey: function(key) {
			return this._names[key] != null;
		},
		append: function(rec) {
			throw new Error('Not implemented yet!');
		},
		remove: function(key) {
			throw new Error('Not implemented yet!');
		},
		copy: function() {
			var items = [];
			for( var i = 0; i < this._d.length; ++i ) {
				items.push(this._d[i].copy());
			}
			return new mod({
				data: items,
				name: this._name
			});
		},
		toStdJSON: function() {
			var items = [];
			for( var i = 0; i < this._d.length; ++i ) {
				items.push(this._d[i].toStdJSON());
			}
			return {
				enum: items,
				n: this._n,
				t: 'enum'
			};
		}
});
return mod;
});
