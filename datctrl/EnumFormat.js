define('fir/datctrl/EnumFormat/EnumFormat', [], function(EnumFormat) {
	//TODO: Please, implement me;)
	return __mixinProto(function EnumFormat(opts) {
		this._items = opts.items || [];
		this._names = {};
		this._reindex();
	}, {
		getName: function(value) {
			return this._names[value] || null;
		},
		getValue: function(name) {
			var i = 0, curItem;
			for( ; i < this._items.length; ++i ) {
				curItem = this._items[i];
				if( curItem.n = name )
					return curItem.v;
			}
			return null;
		},
		getStr: function(value) {
			return this.getName(value);
		},
		_reindex: function() {
			var i = 0, curItem;
			for( ; i < this._items.length; ++i ) {
				curItem = this._items[i];
				this._names[ curItem.v ] = curItem.n;
			}
		}
	});
});
