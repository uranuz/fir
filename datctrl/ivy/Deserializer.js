define('fir/datctrl/ivy/Deserializer', [
	'exports',
	'fir/datctrl/Deserializer',
	'fir/datctrl/ivy/RecordSetAdapter',
	'fir/datctrl/ivy/RecordAdapter',
	'fir/datctrl/ivy/EnumFormatAdapter',
	'fir/datctrl/ivy/EnumAdapter'
], function(
	mod,
	Deserializer,
	RecordSetAdapter,
	RecordAdapter,
	EnumFormatAdapter,
	EnumAdapter
) {

mod.deserializeItem = function(node) {
	var isPOD = Deserializer.isPlainOldObject(node);
	if( !isPOD ) {
		return node;
	}
	var
		typeStr = node.t,
		container = Deserializer.deserializeItem(node);
	if( container == null ) {
		return null;
	}
	switch( typeStr ) {
		case 'recordset':
			return new RecordSetAdapter(container);
		case 'record':
			return new RecordAdapter(container);
		case 'enum':
			return node.hasOwnProperty("d")? new EnumAdapter(container): new EnumFormatAdapter(container);
		case "date": case "dateTime": return container;
		default: break;
	}
	return null;
};

mod.deserialize = Deserializer.deserializeImpl.bind(null, mod.deserializeItem);
});