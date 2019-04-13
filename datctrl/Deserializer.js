define('fir/datctrl/Deserializer', [
	'exports',
	'fir/datctrl/EnumFormat',
	'fir/datctrl/Enum',
	'fir/datctrl/FieldFormat',
	'fir/datctrl/RecordFormat',
	'fir/datctrl/Record',
	'fir/datctrl/RecordSet'
], function(
	mod,
	EnumFormat,
	Enum,
	FieldFormat,
	RecordFormat,
	Record,
	RecordSet
) {

//трансформирует JSON в Record или RecordSet
mod.fromJSON = function(jsonObj, emptyIfFailed) {
	if( !mod.isContainerRawData(jsonObj) ) {
		return emptyIfFailed? void(0): jsonObj;
	}

	if( ['record', 'recordset'].indexOf(jsonObj.t) >= 0 )
	{
		var fmt = mod.recordFormatFromJSON(jsonObj);

		if( jsonObj.t === "record" ) {
			return new Record({
				format: fmt,
				rawData: jsonObj.d
			});
		}
		else if( jsonObj.t === "recordset" ) {
			return new RecordSet({
				format: fmt,
				rawData: jsonObj.d
			});
		}
	} else if( jsonObj.t === 'enum' ) {
		return mod.enumFromJSON(jsonObj);
	}

	return emptyIfFailed? void(0): jsonObj;
};

mod.extractorImpl = function(extractor, node) {
	node = extractor(node);
	if( !(node instanceof Object) ) {
		return node;
	}

	for( var key in node ) {
		if( !node.hasOwnProperty(key) ) {
			continue;
		}
		node[key] = extractor(node[key]);
	}
	return node;
};

mod.tryExtractLvlContainers = mod.extractorImpl.bind(null, mod.fromJSON);

mod.isContainerRawData = function(node) {
	return(
		node != null
		&& (node instanceof Object)
		&& node.hasOwnProperty('t')
		&& (typeof(node.t) === 'string' || node.t instanceof String)
	);
};

mod.deserializeValue = function(val, fmt) {
	var typeStr = fmt.getType();
	// Type strings are in D method getFieldTypeString
	switch( typeStr ) {
		case 'bool':
		case 'int':
		case 'float':
		case 'str':
		case 'array': {
			// Do nothing here for now
			return val;
		}
		case 'date': case 'dateTime': {
			// Convert dates from string
			return new Date(val);
		}
		case 'enum': {
			return new Enum({
				format: fmt,
				value: val
			});
		}
		case 'record': case 'recordset': {
			return mod.fromJSON(val, /*emptyIfFailed=*/false);
		}
		default: throw new Error('Unexpected type of field in format!');
	}
};

mod.deserializeRecordSet = function(data, fmt) {
	if( !(data instanceof Array) ) {
		throw new Error('Record raw data must be instance of array');
	}
	for( var i = 0; i < data.length; ++i ) {
		var row = data[i];
		if( !(row instanceof Array) ) {
			throw new Error('RecordSet data row must be instance of array');
		}
		if( row.length !== fmt.getLength() ) {
			throw new Error('RecordSet data row field count must match field count of record format!')
		}
		for( var j = 0; j < row.length; ++j ) {
			row[j] = this.deserializeValue(row[j], fmt.getFieldFormat(j));
		}
	}
	return data;
};

mod.deserializeRecord = function(data, fmt) {
	if( !(data instanceof Array) ) {
		throw new Error('Record raw data must be instance of array');
	}
	if( data.length !== fmt.getLength() ) {
		throw new Error('Record raw data field count must match field count of record format!')
	}
	for( var i = 0; i < data.length; ++i ) {
		data[i] = this.deserializeValue(data[i], fmt.getFieldFormat(i));
	}
	return data;
};

mod.recordFormatFieldsFromJSON = function(rawFields) {
	for( var i = 0; i < rawFields.length; ++i ) {
		if( rawFields[i].t === "enum" ) {
			rawFields[i] = mod.enumFromJSON(rawFields[i]);
		} else {
			rawFields[i] = new FieldFormat(rawFields[i])
		}
	}

	return rawFields;
};

mod.recordFormatFromJSON = function(jsonObj) {
	return new RecordFormat({
		fields: mod.recordFormatFieldsFromJSON(jsonObj.f),
		keyFieldIndex: jsonObj.kfi
	});
};

mod.enumFromJSON = function(jEnum) {
	if( jEnum.hasOwnProperty("d") ) {
		return new Enum({
			rawData: jEnum.enum,
			value: jEnum.d
		});
	} else {
		return new EnumFormat({
			rawData: jEnum.enum,
			name: jEnum.n
		})
	}
}

});
