define('ivy/directives', [
	'ivy/errors',
	'ivy/DirectiveInterpreter',
	'ivy/utils',
	'ivy/Consts',
	'fir/common/base64'
], function(
	errors,
	DirectiveInterpreter,
	iu,
	Consts
) {
	var
		IvyDataType = Consts.IvyDataType,
		DirAttrKind = Consts.DirAttrKind;
return FirClass(
	function RemoteCallDirInterpreter() {
		this._name = 'int';
		this._attrBlocks = [{
			'kind': DirAttrKind.NamedAttr,
			'namedAttrs': [
				{'name': 'value', 'typeName': 'any'}
			]
		}, {
			'kind': DirAttrKind.BodyAttr,
			'bodyAttr': {}
		}]
	}, DirectiveInterpreter, {
		interpret: function(interp) {
			var
				uriNode = interp.getValue("uri"), uriType = iu.getDataNodeType(uriNode),
				methodNode = interp.getValue("method"), methodType = iu.getDataNodeType(methodNode),
				dataNode = interp.getValue("data"), dataType = iu.getDataNodeType(dataNode),
				forwardHTTPHeadersNode = interp.getValue("forwardHTTPHeaders"), forwardHTTPHeadersType = iu.getDataNodeType(forwardHTTPHeadersNode),
				callbackNode = interp.getValue("callback"), callbackType = iu.getDataNodeType(callbackNode),
				errbackNode = interp.getValue("errback"), errbackType = iu.getDataNodeType(errbackNode);
			interp.internalAssert(uriType == IvyDataType.String, `Expected string as URI parameter`);
			interp.internalAssert(
				[IvyDataType.String, IvyDataType.Undef, IvyDataType.Null].canFind(methodType.type),
				`Expected string as HTTP-method parameter`);
			interp.internalAssert(
				[IvyDataType.String, IvyDataType.Undef, IvyDataType.Null].canFind(dataType.type),
				`Expected string as data parameter`);
			interp.internalAssert(
				[IvyDataType.AssocArray, IvyDataType.Undef, IvyDataType.Null].canFind(forwardHTTPHeadersType),
				`Expected assoc array as forwardHTTPHeaders global variable`);
			interp.internalAssert(
				[IvyDataType.Callable, IvyDataType.Undef, IvyDataType.Null].canFind(callbackType),
				`Expected Callable or null as callback method`);
			interp.internalAssert(
				[IvyDataType.Callable, IvyDataType.Undef, IvyDataType.Null].canFind(errbackType),
				`Expected Callable or null as errback method`);

			if( forwardHTTPHeadersType == IvyDataType.AssocArray )
			for( var name in forwardHTTPHeadersNode ) {
				var valNode = forwardHTTPHeadersNode[name];
				interp.internalAssert(
					iu.getDataNodeType(valNode) === IvyDataType.String,
					`HTTP header value expected to be string`);
			}

			$.ajax(uriNode, {
				success: function(jsonText) {
					var json = JSON.parse(jsonText);
					
				},
				error: function(error) {
					console.error(error);
				}
			});
		}
	});
});