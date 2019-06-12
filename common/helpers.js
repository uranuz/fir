/**
 * @description Модуль для вспомогательных утилит
 * @author Ur@nuz
 */
define('fir/common/helpers', [
	'fir/common/consts'
], function(Consts) {
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
		},
		/** Подписывается на событие keyup, и запускает коллбэк, если нажата клавиша ENTER */
		doOnEnter: function(elem, callback) {
			elem = $(elem);
			var throttledCb = helpers.throttle(callback, 1000, false);
			elem.on('keyup', function(ev) {
				if( ev.keyCode === Consts.KeyCode.Enter ) {
					throttledCb.apply(this, arguments);
				}
			});
		},
		/**
		 * На основе функции callback создает новую функцию, которая пропускает повторные вызовы в интервале времени timeout
		 * после первого вызова. Если trailing=true, в конце периода, если были пропущенные вызовы, то выполняется повтор последнего
		 */
		throttle: function(callback, timeout, trailing) {
			var
				inThrottle = false,
				savedThis, savedArgs;
			function throttled() {
				if( !inThrottle ) {
					// Первый вызов
					inThrottle = true;
					// Чистим параметры, чтобы не было утечек
					savedArgs = null;
					savedThis = null;
					callback.apply(this, arguments);
				} else if( trailing ) {
					// Сохраняем параметры, если нужен повтор последнего пропущенного вызова
					savedThis = this;
					savedArgs = arguments;
				}

				setTimeout(function() {
					inThrottle = false;
					if (trailing && savedArgs) {
						// Выполняем повтор последнего пропущенного вызова, если он был
						callback.apply(savedThis, savedArgs);
						// Чистим параметры, чтобы не было утечек
						savedArgs = null;
						savedThis = null;
					}
				}, timeout);
			}
			return throttled;
		},
		/**
		 * Получает осуществляет "рекурсивный" поиск узлов по списку изначальных узлов roots (по селектору).
		 * Выбирает только "наименее вложенные" элементы подходящие по селектору.
		 * Т.е. если внутри подходящего элемента есть еще подходящие, то они уже не будут выбраны.
		 * Элементы из корневого списка (если подходят под селектор) тоже попадут в результат.
		 */
		getOuterMost: function(roots, selector, stopSelector, findFirstOne) {
			var
				jRoots = $(roots),
				nextRoots = [],
				result = [],
				it;
			// Ищем пока есть, где искать
			while( jRoots.length > 0 ) {
				// Проход по всем элементам данного уровня
				for( var i = 0; i < jRoots.length; ++i ) {
					it = jRoots[i];
					if( it.nodeType !== 1 ) {
						continue;
					}
					if( $(it).is(selector) ) {
						if( findFirstOne ) {
							return $(it);
						} else {
							result.push(it); // Подошло - добавляем в результат
						}
					} else {
						// Не подошло - будем смотреть детей внутри него
						for( var k = 0; k < it.children.length; ++k ) {
							var child = it.children[k];
							// Не заходим внутрь, если поймали критерий останова
							if( !stopSelector || !$(child).is(stopSelector) ) {
								nextRoots.push(child);
							}
						}
					}
				}
				jRoots = nextRoots;
				nextRoots = [];
			}
			return $(result);
		}
	};
	return helpers;
});
