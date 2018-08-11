define('fir/datctrl/ivy/helpers', [
	'exports',
	'fir/datctrl/helpers',
	'fir/datctrl/ivy/RecordSetAdapter',
	'fir/datctrl/ivy/RecordAdapter'
], function(
	exports,
	DatctrlHelpers,
	RecordSetAdapter,
	RecordAdapter
) {
exports._isContainerRawData = function(node) {
	return(
		node != null
		&& (node instanceof Object)
		&& node.hasOwnProperty('t')
		&& (typeof(node.t) === 'string' || node.t instanceof String)
	);
};

/*
auto tryExtractRecordSet(ref TDataNode srcNode)
{
	if( !_isContainerRawData(srcNode) && srcNode["t"].str != "recordset" ) {
		return null;
	}
	return new RecordSetAdapter(srcNode);
}

auto tryExtractRecord(ref TDataNode srcNode)
{
	if( !_isContainerRawData(srcNode) && srcNode["t"].str != "record" ) {
		return null;
	}
	return new RecordAdapter(srcNode);
}
*/

exports.tryExtractContainer = function(node) {
	if( !this._isContainerRawData(node) ) {
		return node;
	}

	switch( node.t ) {
		case 'recordset':
			return new RecordSetAdapter( DatctrlHelpers.fromJSON(node) );
		case 'record':
			return new RecordAdapter( DatctrlHelpers.fromJSON(node) );
		default: break;
	}
	return node;
};

exports.tryExtractLvlContainers = function(node) {
	node = this.tryExtractContainer(node);
	if( !(node instanceof Object) ) {
		return node;
	}

	for( var key in node ) {
		node[key] = this.tryExtractContainer(node[key]);
	}
	return node;
}

});