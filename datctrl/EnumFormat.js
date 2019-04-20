define('fir/datctrl/EnumFormat', [
	'fir/datctrl/iface/RecordSet',
	'fir/datctrl/RecordSetMixin',
	'fir/datctrl/iface/FieldFormat',
	'fir/common/helpers',
	'fir/datctrl/Deserializer'
], function(
	IRecordSet,
	RecordSetMixin,
	IFieldFormat,
	helpers,
	Deserializer
) {
var mod = FirClass(
	function EnumFormat(opts) {
		opts = opts || {};
		if( !(opts.rawData instanceof Array)  ) {
			throw new Error('Expected enum items option');
		}
		if( opts.name != null && typeof(opts.name) !== 'string' && !(opts.name instanceof String) ) {
			throw new Error('Expected string of null as enum field name');
		}
		this._d = opts.rawData || [];
		this._n = opts.name;
		this._names = {};
		this._fmt = Deserializer.deserializeRecordFormat({
			f: [
				{"n": 'value', t: "str"},
				{"n": 'name', t: "str"}
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
		getRecord: function(key) {
			return this._names[key] == null? null: this.getRecordAt( this._names[key][0] );
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
			return new mod({
				rawData: helpers.deepCopy(this._d),
				name: this._name
			});
		},
		toStdJSON: function() {
			return {
				enum: this._d,
				n: this._n,
				t: 'enum'
			};
		}
});
return mod;
});
