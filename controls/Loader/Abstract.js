define('fir/controls/Loader/Abstract', ["fir/common/globals"], function(globals) {
return FirClass(
	function LoaderAbstract() {
		throw new Error('Unable to create instance of abstract class!');
	}, {
		canLoad: function() {
			return false;
		},
		load: function(opts) {
			throw new Error('Cannot call `load` for LoaderAbstract');
		}
	}
);
});