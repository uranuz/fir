define('fir/ivy/UnwrappableNode', [
], function(
) {
'use strict';

return FirClass(
	function OptStorageInterpreter() {
	}, {
		unwrap: function(interp) {
			throw new Error('Not implemented!');
		}
	});
});