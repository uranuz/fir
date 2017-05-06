/**
 * @description Модуль для вспомогательных утилит
 * @author Ur@nuz
 */
define('fir/common/helpers', [], function() {
	return {
		inherit: function (proto) {
			function F() {}
			F.prototype = proto;
			var object = new F;
			return object;
		},
		//Глубокая копия объекта
		deepCopy: function(o) {
			var i, c, p, v;
			if( !o || "object" !== typeof o )
			{	return o;
			}
			else if( o instanceof Array )
			{	c = [];
				for( i = 0; i < o.length; i++)
					c.push( webtank.deepCopy(o[i]) );
			}
			else
			{	c = {};
				for(p in o) {
					if( o.hasOwnProperty(p) ) {
						c[p] = webtank.deepCopy(o[p]);
					}
				}
			}
			return c;
		},
		//Поверхностная копия объекта (если свойства объекта
		//являются объектами, то копируются лишь ссылки)
		copy: function(o) {
			return jQuery.extend({}, o);
		},
		isInteger: function(num) {
			return Math.max(0, num) === num;
		},
		isUnsigned: function(num) {
			return Math.round(num) === num;
		},
		getXMLHTTP: function() {
			var xmlhttp;
			try {
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (E) {
					xmlhttp = false;
				}
			}
			if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
				xmlhttp = new XMLHttpRequest();
			}
			return xmlhttp;
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
});
