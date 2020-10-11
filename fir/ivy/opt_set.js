define('fir/ivy/opt_set', [
	'ivy/types/data/iface/class_node'
], function(IClassNode) {
var optSetCounter = 0;
return OptStorage = FirClass(
	function OptSet() {
		this._id = ++optSetCounter;
	}, IClassNode, {
		id: firProperty(function() {
			return this._id; 
		}),

		/** Analogue to IvyData __serialize__(); in D impl */
		__serialize__: function() {
			return this.id;
		}
	});
});