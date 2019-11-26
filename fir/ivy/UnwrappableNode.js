define('fir/ivy/UnwrappableNode', [
], function(
) {
'use strict';

return FirClass(
	function UnwrappableNode() {
	}, {
		unwrap: function(interp) {
			throw new Error('Not implemented!');
		}
	});
});