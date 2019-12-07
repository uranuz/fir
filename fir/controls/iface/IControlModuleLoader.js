define('fir/controls/iface/IControlModuleLoader', [], function() {
return FirClass(
	function IControlModuleLoader() {
		throw new Error('Unable co create instance of interface IControlModuleLoader')
	}, {
		load: function(moduleName) {
			throw new Error('Method is not implemented!');
		}
});
});