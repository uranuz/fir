define('fir/ivy/directive/to_json_base64', [
	'ivy/interpreter/directive/utils',
	'fir/common/base64'
], function(du, base64) {
return FirClass(
	function ToJSONBase64DirInterpreter() {
		this._symbol = new du.DirectiveSymbol(`toJSONBase64`, [du.DirAttr("value", du.IvyAttrType.Any)]);
	}, du.BaseDirectiveInterpreter, {
		interpret: function(interp) {
			var serialized = idat.toStdJSON(interp.getValue("value"));
			interp._stack.push(base64.encodeUTF8(serialized));
		}
	});
});