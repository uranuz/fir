define('fir/datctrl/Deserializer', [], function() {
	return {
		deserializeRecord: function(data, fmt) {
			if( !(data instanceof Array) ) {
				throw new Error('Record raw data must be instance of array');
			}
			if( data.length !== fmt.getLength() ) {
				throw new Error('Record raw data field count must match field count of record format!')
			}
			for( var i = 0; i < data.length; ++i ) {
				data[i] = this.deserializeValue(data[i], fmt.getType(i));
			}
			return data;
		},
		deserializeValue: function(val, typeStr) {
			// Type strings are in D method getFieldTypeString
			switch( typeStr ) {
				case 'bool':
				case 'int':
				case 'float':
				case 'str':
				case 'enum':
				case 'array': {
					// Do nothing here for now
					return val;
				}
				case 'date': case 'dateTime': {
					// Convert dates from string
					return new Date(val);
				}
				default: throw new Error('Unexpected type of field in format!');
			}
		},
		deserializeRecordSet: function(data, fmt) {
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
					row[j] = this.deserializeValue(row[j], fmt.getType(j));
				}
			}
			return data;
		}
	}
});
