define('fir/controls/Loader/Manager', [
	'fir/controls/Loader/Abstract'
], function(LoaderAbstract) {
// This is singleton class
return new (FirClass(
	function LoadManager() {
		this._loaders = [];
	}, {
		/** Register loader in manager */
		add: function(loader) {
			if( !(loader instanceof LoaderAbstract) ) {
				throw new Error('Loader should be instance of LoaderAbstract');
			}
			this._loaders.push(loader);
		},
		/**
		 * Starts loading of control from somewhere using following options:
		 * opts: {
		 * 	success: function to pass result
		 * 	error: error handler function
		 * 	params: required options
		 * 	method: name of method to retrieve data
		 * 	ivyModule: name of module where control is located
		 * 	ivyMethod: name of control class
		 * }
		 */
		load: function(opts) {
			for( var i = 0; i < this._loaders.length; ++i ) {
				var loader = this._loaders[i];
				if( !loader.canLoad(opts) ) {
					continue;
				} else {
					return loader.load(opts);
				}
			}
			throw new Error('Unable to find suitable loader!');
		}
	}
));
})