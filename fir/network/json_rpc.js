define('fir/network/json_rpc', [
	'fir/common/Deferred'
], function(Deferred) {
	var json_rpc = {
		/** Аргументы по-умолчанию для вызова ф-ции invoke */
		defaultInvokeArgs: {
			uri: "/",  //Адрес для отправки
			method: null, //Название удалённого метода для вызова в виде строки
			params: null, //Параметры вызова удалённого метода
			success: null, //Обработчик успешного вызова удалённого метода
			error: null,  //Обработчик ошибки
			id: null //Идентификатор соединения
		},
		_counter: 0,
		_generateId: function(args) {
			return json_rpc._counter++;
		},
		/** 
		 * Вызов удалённой процедуры по протоколу JSON-RPC
		 * @param {object} args - объект с параметрами вызова (описание в defaultInvokeArgs)
		 */
		invoke: function(args) {
			var
				resDef = new Deferred(),
				callDef = new Deferred(),
				_defArgs = json_rpc.defaultInvokeArgs,
				_args = _defArgs;

			if( args )
				_args = args;

			_args.params = json_rpc._processParams(_args.params);
			callDef.then(
				function() {
					var succArgs = Array.prototype.slice.call(arguments);
					resDef.resolve.apply(resDef, succArgs);
					if( typeof(_args.success) === 'function' ) {
						_args.success.apply(null, succArgs);
					}
				},
				function(err) {
					var errArgs = Array.prototype.slice.call(arguments);
					console.error("Ошибка при выполнении удалённого метода: " + JSON.stringify(err));
					if( typeof(_args.error) === 'function' ) {
						_args.error.apply(null, errArgs);
					}
				});

			var xhr = new XMLHttpRequest();
			xhr.open('POST', _args.uri, true);
			xhr.setRequestHeader("content-type", "application/json-rpc");
			xhr.onreadystatechange = json_rpc._handleResponse.bind(null, xhr, callDef)
			var idStr = "";
			if( _args.error || _args.success || _args.complete ) {
				if( !_args.id ) {
					_args.id = json_rpc._generateId(_args);
				}
				idStr = ',"id":"' + _args.id + '"';
			}
			xhr.send( '{"jsonrpc":"2.0","method":"' + _args.method + '","params":' + _args.params + idStr + '}' );
			return resDef;
		},
		_handleResponse: function(xhr, def) {
			if( xhr.readyState !== 4 ) {
				return;
			}
			var responseJSON;
			try {
				responseJSON = JSON.parse(xhr.responseText);
			} catch(err) {
				def.reject(err);
				return; // Nothing to do there
			}

			if( !typeof(responseJSON.result) === 'undefined' && responseJSON.error == null ) {
				def.reject(new Error(`В ответе по протоколу JSON-RPC нет "result" и "error"!`));
				return; // ...
			}
			if( responseJSON.error != null ) {
				def.reject(responseJSON.error);
			} else {
				def.resolve(responseJSON.result);
			}
		},
		_processParams: function(params) {
			if( typeof params === "object" ) {
				return JSON.stringify(params);
			} else if( typeof(params) === "function" || typeof(params) === "undefined" ) {
				return '"null"';
			} else if( typeof(params) === "string" ) {
				return '"' + params + '"';
			} else {
				return params; // Для boolean, number
			}
		}
	};
	return json_rpc;
});
