define('fir/common/Deferred', [], function(Consts) {
'use strict';
/**
 * Сейчас это обертка на jquery Deferred.
 * Но благодаря ей можно будет легко перейти на Promise при желании
 */
return FirClass(
	function FirDeferred() {
		this._deferred = new $.Deferred();
	}, {
		then: function(doneFn, failFn) {
			if( (doneFn != null) && (typeof doneFn !== 'function') ) {
				throw new Error('doneFn argument expected to be function, undefined or null');
			}
			if( (failFn != null) && (typeof failFn !== 'function') ) {
				throw new Error('failFn argument expected to be function, undefined or null');
			}
			this._deferred.then(doneFn, failFn);
		},
		catch: function(failFn) {
			if( (failFn != null) && (typeof failFn !== 'function') ) {
				throw new Error('failFn argument expected to be function, undefined or null');
			}
			this._deferred.catch(failFn);
		},
		resolve: function() {
			this._deferred.resolve.apply(this._deferred, Array.prototype.slice.call(arguments));
		},
		reject: function() {
			this._deferred.reject.apply(this._deferred, Array.prototype.slice.call(arguments));
		}
	});
});