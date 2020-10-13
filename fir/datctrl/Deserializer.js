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
	var
		isPOD = mod.isPlainOldObject(node),
		// Предполагаем, что null всегда десериализуется в null,
		// а внутренняя реализация всегда возвращает null, если не удалось десеарилизовать
		data = itemDeserializer(node);
	if( data !== null ) {
		return data; // Десеварилизовалось - дальше не надо ходить
	} else if( isPOD ) {
		for( var key in node ) {
			if( !node.hasOwnProperty(key) ) {
				continue;
			}
			// Проходим по свойствам объекта, пытаемся их рекурсивно разобрать
			node[key] = mod.deserializeImpl(itemDeserializer, node[key]);
		}
	}
	return node;
};

mod.deserializeItem = function(node) {
	if( node === 'undef' ) {
		return undefined;
	} else if( mod.isContainerRawData(node) ) {
		switch( node.t ) {
			case "recordset": return new RecordSet({
				format: mod.deserializeRecordFormat(node),
				rawData: node.d
			});

			case "record": return new Record({
				format: mod.deserializeRecordFormat(node),
				rawData: node.d
			});

			case "enum": {
				// Тут либое енум, либо енум-формат в зависимости от присутствия поля "d"
				if( node.hasOwnProperty('d') ) {
					return new Enum({
						format: mod.deserializeEnumFormat(node),
						value: node.d
					});
				} else {
					return mod.deserializeEnumFormat(node);
				}
			}

			case "date":
			case "dateTime":
				return new Date(val.d);
		}
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
	var items = [];
	for( var i = 0; i < data.length; ++i ) {
		var row = data[i];
		if( !(row instanceof Array) ) {
			throw new Error('RecordSet data row must be instance of array');
		}
		if( row.length !== fmt.length ) {
			throw new Error('RecordSet data row field count must match field count of record format!')
		}
		items.push(new Record({
			format: fmt,
			data: mod.deserializeRecord(row, fmt)
		}));
	}
	return items;
};

mod.deserializeRecord = function(data, fmt) {
	if( !(data instanceof Array) ) {
		throw new Error('Record raw data must be instance of array');
	}
	if( data.length !== fmt.length ) {
		throw new Error('Record raw data field count must match field count of record format!')
	}
	var items = [];
	for( var i = 0; i < data.length; ++i ) {
		items.push(mod.deserializeRecordValue(data[i], fmt.getFieldFormat(i)));
	}
	return items;
};

mod.deserializeRecordFormatFields = function(rawFields) {
	var items = [];
	for( var i = 0; i < rawFields.length; ++i ) {
		if( rawFields[i].t === "enum" ) {
			items.push(mod.deserializeEnumFormat(rawFields[i]));
		} else {
			items.push(new FieldFormat(rawFields[i]));
		}
	}
	return items;
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
