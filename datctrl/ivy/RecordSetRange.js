define('fir/datctrl/ivy/RecordSetRange', [
	'ivy/DataNodeRange',
	'fir/datctrl/ivy/RecordAdapter'
], function(DataNodeRange, RecordAdapter) {
return FirClass(
	function RecordSetRange(rs) {
		this._rs = rs;
		this._i = 0;
	}, DataNodeRange, {
		// Method must return first item of range or raise error if range is empty
		front: function() {
			if( this.empty() ) {
				throw new Error('Range is empty!');
			}
			return new RecordAdapter(this._rs.at(this._i));
		},
		// Method must advance range to the next item
		pop: function() {
			var item = this.front();
			++this._i;
			return item;
		},
		// Method is used to check if range is empty
		empty: function() {
			return this._i >= this._rs.getLength();
		}
});
});