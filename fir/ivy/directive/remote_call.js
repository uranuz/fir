define('fir/ivy/directive/remote_call', [
	'ivy/interpreter/directive/utils',
	'ivy/types/data/async_result',
	'fir/network/json_rpc'
], function(
	du,
	AsyncResult,
	json_rpc
) {
var IvyDataType = du.IvyDataType,
return FirClass(
	function RemoteCallInterpreter() {
		this._symbol = new du.DirectiveSymbol(`remoteCall`, [
			du.DirAttr("uri", du.IvyAttrType.Any),
			du.DirAttr("method", du.IvyAttrType.Any),
			du.DirAttr("data", du.IvyAttrType.Any)
		]);
	}, du.BaseDirectiveInterpreter, {
		interpret: function(interp) {
			var
				uriNode = interp.getValue("uri"),
				methodNode = interp.getValue("method"),
				dataNode = interp.getValue("data");
			interp.internalAssert(
				idat.type(uriNode) === IvyDataType.String,
				`Expected string as URI parameter`);
			interp.internalAssert(
				[IvyDataType.String, IvyDataType.Undef, IvyDataType.Null].includes(idat.type(methodNode)),
				`Expected string as HTTP-method parameter`);
			interp.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Undef, IvyDataType.Null].includes(idat.type(dataNode)),
				`Expected assoc array as data parameter`);

			var fResult = new AsyncResult();
			json_rpc.invoke({
				uri: uriNode,
				method: methodNode,
				params: dataNode
			}).then(
				fResult.resolve.bind(fResult),
				fResult.reject.bind(fResult));
			interp._stack.push(fResult);
		}
	});
});