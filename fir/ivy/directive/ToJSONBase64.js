define('fir/ivy/directive/ToJSONBase64', [
	'ivy/interpreter/directive/iface',
	'ivy/utils',
	'ivy/types/data/consts',
	'fir/common/base64'
], function(
	DirectiveInterpreter,
	iu,
	Consts,
	base64
) {
	var
		IvyDataType = Consts.IvyDataType,
		DirAttrKind = Consts.DirAttrKind;
return FirClass(
	function ToJSONBase64DirInterpreter() {
		this._name = 'toJSONBase64';
		this._attrBlocks = [{
			'kind': DirAttrKind.ExprAttr,
			'exprAttrs': [{ 'name': 'value', 'typeName': 'any' }]
		}, {
			'kind': DirAttrKind.BodyAttr,
			'bodyAttr': {}
		}]
	}, DirectiveInterpreter, {
		interpret: function(interp) {
			var serialized = iu.toStdJSON(interp.getValue("value"));
			interp._stack.push(base64.encodeUTF8(serialized));
		}
	});
});