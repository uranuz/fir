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

mod.deserializeImpl = function(itemDeserializer, node) {
	var isPOD = mod.isPlainOldObject(node);
	if( !isPOD ) {
		return node;
	}
	// Пытаемся десериализовать сам этот объект
	var data = itemDeserializer(node);
	if( data != null ) {
		return data; // Десеварилизовалось - дальше не надо ходить
	}

	for( var key in node ) {
		if( !node.hasOwnProperty(key) ) {
			continue;
		}
		// Проходим по свойствам объекта, пытаемся их рекурсивно разобрать
		node[key] = mod.deserializeImpl(itemDeserializer, node[key]);
	}
	return node;
};

mod.deserializeItem = function(rawData) {
	if( !mod.isContainerRawData(rawData) ) {
		return null;
	}
	switch( rawData.t ) {
		case "recordset": return new RecordSet({
			format: mod.deserializeRecordFormat(rawData),
			rawData: rawData.d
		});

		case "record": return new Record({
			format: mod.deserializeRecordFormat(rawData),
			rawData: rawData.d
		});

		case "enum": {
			// Тут либое енум, либо енум-формат в зависимости от присутствия поля "d"
			if( rawData.hasOwnProperty('d') ) {
				return new Enum({
					format: mod.deserializeEnumFormat(rawData),
					value: rawData.d
				});
			} else {
				return mod.deserializeEnumFormat(rawData);
			}
		}

		case "date": case "dateTime": return new Date(val.d);
	}
	return null; // Ниче не удалось найтить
}

mod.isPlainOldObject = function(node) {
	if( !(node instanceof Object) ) {
		return false;
	}
	var proto = Object.getPrototypeOf(node);
	return proto != null && Object.getPrototypeOf(proto) === null;
};

mod.isContainerRawData = function(node) {
	return(
		node != null
		&& mod.isPlainOldObject(node)
		&& node.hasOwnProperty('t')
		&& (typeof(node.t) === 'string' || node.t instanceof String)
	);
};

mod.deserializeRecordValue = function(val, fmt) {
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
			row[j] = this.deserializeRecordValue(row[j], fmt.getFieldFormat(j));
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
		data[i] = this.deserializeRecordValue(data[i], fmt.getFieldFormat(i));
	}
	return data;
};

mod.deserializeRecordFormatFields = function(rawFields) {
	for( var i = 0; i < rawFields.length; ++i ) {
		if( rawFields[i].t === "enum" ) {
			rawFields[i] = mod.deserializeEnumFormat(rawFields[i]);
		} else {
			rawFields[i] = new FieldFormat(rawFields[i])
		}
	}

	return rawFields;
};

mod.deserializeRecordFormat = function(rawData) {
	return new RecordFormat({
		fields: mod.deserializeRecordFormatFields(rawData.f),
		keyFieldIndex: rawData.kfi
	});
};

mod.deserializeEnumFormat = function(rawData) {
	return new EnumFormat({
		rawData: rawData.enum,
		name: rawData.n
	})
};

mod.deserialize = mod.deserializeImpl.bind(null, mod.deserializeItem);

});
