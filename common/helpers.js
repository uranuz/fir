/**
 * @description Модуль для вспомогательных утилит
 * @author Ur@nuz
 */
define('fir/common/helpers', [], function() {
	'use strict';
	var helpers = {
		//Глубокая копия объекта
		deepCopy: function(o) {
			var i, c, p, v;
			if( !o || "object" !== typeof o ) {
				return o;
			} else if( o instanceof Array ) {
				c = [];
				for( i = 0; i < o.length; i++)
					c.push( helpers.deepCopy(o[i]) );
			} else {
				c = {};
				for(p in o) {
					if( o.hasOwnProperty(p) ) {
						c[p] = helpers.deepCopy(o[p]);
					}
				}
			}
			return c;
		},
		isInteger: Number.isInteger,
		isUnsigned: function(num) {
			return Number.isInteger(num) && num >= 0;
		},
		parseGetParams: function() {
			var $_GET = {};
			var __GET = window.location.search.substring(1).split("&");
			for(var i=0; i<__GET.length; i++) {
				var getVar = __GET[i].split("=");
				$_GET[getVar[0]] = typeof(getVar[1])=="undefined" ? "" : getVar[1];
			}
			return $_GET;
		},
		getScrollTop: function() {
			return (
				(window.pageYOffset !== undefined) ? window.pageYOffset :
				(document.documentElement || document.body.parentNode || document.body).scrollTop
			);
		},
		getScrollLeft: function() {
			return (
				(window.pageXOffset !== undefined) ? window.pageXOffset :
				(document.documentElement || document.body.parentNode || document.body).scrollLeft
			);
		}
	};
	return helpers;
});
