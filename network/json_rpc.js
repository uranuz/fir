define('fir/network/json_rpc', ['fir/common/helpers'], function(commonHelpers) {
	var json_rpc = {
		//Аргументы по-умолчанию для вызова ф-ции invoke
		defaultInvokeArgs: {
			uri: "/",  //Адрес для отправки
			method: null, //Название удалённого метода для вызова в виде строки
			params: null, //Параметры вызова удалённого метода
			success: null, //Обработчик успешного вызова удалённого метода
			error: null,  //Обработчик ошибки
			complete: null, //Обработчик завершения (после success или error)
			id: null //Идентификатор соединения
		},
		_counter: 0,
		_responseQueue: [null],
		_generateId: function(args) {
			return json_rpc._counter++;
		},
		invoke: function(args) //Функция вызова удалённой процедуры
		{	var
				undefined = ( function(undef){ return undef; })(),
				_defArgs = json_rpc.defaultInvokeArgs,
				_args = _defArgs;

			if( args )
				_args = args;

			_args.params = json_rpc._processParams(_args.params);

			var xhr = commonHelpers.getXMLHTTP();
			xhr.open( "POST", _args.uri, true );
			xhr.setRequestHeader("content-type", "application/json-rpc");
			//
			xhr.onreadystatechange = function() {	json_rpc._handleResponse(xhr); }
			var idStr = "";
			if( _args.error || _args.success || _args.complete )
			{	if( !_args.id )
					_args.id = json_rpc._generateId(_args);
				json_rpc._responseQueue[_args.id] = _args;
				idStr = ',"id":"' + _args.id + '"';
			}
			xhr.send( '{"jsonrpc":"2.0","method":"' + _args.method + '","params":' + _args.params + idStr + '}' );
		},
		_handleResponse: function(xhr)
		{	if( xhr.readyState === 4 )
			{	var
					responseJSON = JSON.parse(xhr.responseText),
					invokeArgs = null;

				if( responseJSON.id )
				{	invokeArgs = json_rpc._responseQueue[responseJSON.id];
					if( invokeArgs )
					{	delete json_rpc._responseQueue[responseJSON.id];
						if( responseJSON.error )
						{	if( invokeArgs.error )
								invokeArgs.error(responseJSON);
							else
							{	console.error("Ошибка при выполнении удалённого метода");
								console.error(responseJSON.error.toString());
							}
						}
						else
						{	if( invokeArgs.success )
								invokeArgs.success(responseJSON.result);
						}
						if( invokeArgs.complete )
							invokeArgs.complete(responseJSON);
					}
				}
			}
		},
		_processParams: function(params) {
			if( typeof params === "object" )
				return JSON.stringify(params);
			else if( (typeof params === "function") || (typeof params === "undefined") )
				return '"null"';
			else if( typeof params === "string" )
				return '"' + params + '"';
			else //Для boolean, number
				return params;
		}
	};
	return json_rpc;
});
