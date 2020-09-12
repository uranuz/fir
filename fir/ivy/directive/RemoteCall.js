define('fir/ivy/directive/RemoteCall', [
	'ivy/interpreter/directive/iface',
	'ivy/utils',
	'ivy/types/data/consts',
	'ivy/types/data/async_result',
	'fir/network/json_rpc'
], function(
	DirectiveInterpreter,
	iu,
	Consts,
	AsyncResult,
	json_rpc
) {
'use strict';
var
	IvyDataType = Consts.IvyDataType,
	DirAttrKind = Consts.DirAttrKind;
return FirClass(
	function RemoteCallInterpreter() {
		this._name = 'remoteCall';
		this._attrBlocks = [{
			'kind': DirAttrKind.NamedAttr,
			'namedAttrs': {
				uri: {name: 'uri', typeName: 'any'},
				method: {name: 'method', typeName: 'any'},
				data: {name: 'data', typeName: 'any'}
			}
		}, {
			'kind': DirAttrKind.BodyAttr,
			'bodyAttr': {}
		}]
	}, DirectiveInterpreter, {
		interpret: function(interp) {
			var
				uriNode = interp.getValue("uri"), uriType = iu.getDataNodeType(uriNode),
				methodNode = interp.getValue("method"), methodType = iu.getDataNodeType(methodNode),
				dataNode = interp.getValue("data"), dataType = iu.getDataNodeType(dataNode);
			interp.internalAssert(uriType === IvyDataType.String, `Expected string as URI parameter`);
			interp.internalAssert(
				[IvyDataType.String, IvyDataType.Undef, IvyDataType.Null].indexOf(methodType) >= 0,
				`Expected string as HTTP-method parameter`);
			interp.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Undef, IvyDataType.Null].indexOf(dataType) >= 0,
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