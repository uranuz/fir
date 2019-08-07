define('fir/controls/Validation/Controller/Controller', [
	'fir/controls/FirControl',
	'fir/controls/ControlManager',
	'fir/controls/Validation/Center',
	'css!fir/controls/Validation/Controller/Controller'
], function(FirControl, ControlManager, ValidationCenter) {
return FirClass(
	function ValidationController(opts) {
		this.superproto.constructor.call(this, opts);
		this._owner = null;
		this._validators = [];
		this._popup = null;
	}, FirControl, {
		/**
		 * Установить владельца контроллера валидации
		 * @param {FirControl} owner владелец контроллера валидации
		 */
		setOwner: function(owner) {
			this._checkOwnerImpl(owner)
			this._owner = owner;
		},

		// Проверить наличие владельца контроллера валидации
		_checkOwner: function() {
			this._checkOwnerImpl(this._owner);
		},

		_checkOwnerImpl: function(owner) {
			if( !(owner instanceof FirControl) ) {
				throw new Error('Expected FirControl instance as validation controller owner');
			}
		},

		/**
		 * Добавить валидаторы к контроллеру
		 * @param {Array} validators 
		 */
		addValidators: function(validators) {
			if ( !(validators instanceof Array) ) {
				throw new Error('Expected array of validators')
			}
			this._checkOwner();
			for( var i = 0; i < validators.length; ++i ) {
				var vld = validators[i];
				/*
				if( typeof(vld.fn) === 'string' || vld.fn instanceof String ) {
					vld.fn = this._owner[vld.fn];
				}
				*/
				if( typeof(vld.fn) !== 'function' ) {
					throw new Error('Expected validator function')
				}
				if( vld.control != null && !(vld.control instanceof FirControl) ) {
					throw new Error('Expected FirControl instance in control option or empty')
				}

				this._validators.push(vld);

				vld.control = vld.control || this._owner;

				if( typeof(vld.elem) === 'string' || vld.elem instanceof String ) {
					vld.elem = vld.control._elems(vld.elem);
				}

				vld.elem = vld.elem || control._getContainer();
				vld._bondValidator = this._elemValidationDoer.bind(this, vld);
				vld.elem.on('blur', vld._bondValidator);
			}
		},

		// Визульная пометка элемента прошедшим или не прошедшим проверку
		_markIfValid: function(result, elem) {
			if( this._checkResult(result) ) {
				elem.removeClass('fir-IsInvalidField');
			} else {
				elem.addClass('fir-IsInvalidField');
			}
		},

		// Проверка результата проверки
		_checkResult: function(result) {
			return result == null || result === true;
		},

		// Получить сообщение проверки
		_validationMsg: function(result) {
			if( this._checkResult(result) ) {
				return null;
			} else {
				return typeof(result) == 'string'? result: 'Field value is not valid';
			}
		},

		_elemValidationDoer: function(vld, ev) {
			var
				elem = $(ev.currentTarget),
				result = vld.fn.call(vld.control, vld);
			this._markIfValid(result, elem);
			if( this._checkResult(result) ) {
				this._closePopup();
			} else {
				this._openPopup(this._validationMsg(result), elem);
			}
		},

		// Открытие всплывающего блока с сообщением проверки
		_openPopup: function(message, elem) {
			// Староя всплываха должна быть аннигилирована до открытия новой
			this._closePopup();

			var config = {
				ivyModule: 'fir.controls.Validation.Popup',
				ivyMethod: 'ValidationPopup',
				viewParams: {
					instanceName: this.instanceName() + 'Popup',
					message: message
				}
			};
			// Чистим все, что вдруг осталось внутри
			this._elems('popupWrapper').empty();

			// Создаем плейсхолдер, который будет заменен на всплываху
			config.target = $('<div>').appendTo(this._elems('popupWrapper'));
			config.success = this._onPopup_load.bind(this, elem);

			ControlManager.createControl(config)
		},

		// Закрытие всплывающего блока с сообщением проверки
		_closePopup: function() {
			if( !this._popup ) {
				return;
			}
			this._popup.destroy();
		},

		_onPopup_load: function(elem, popup) {
			this._popup = popup;
			// Заменяем всплываху в центре на новую
			ValidationCenter.setPopup(this._popup);
			this._popup.once('onDestroy', this._onPopup_destroyed.bind(this));
			elem.after(this._popup._getContainer());

			// Компенсируем разницу в позиции контейнера и валидируемого элемента
			var cont = this._popup._elems('container');
			cont.css({
				left: elem.offset().left - cont.offset().left,
				top: elem.offset().top - cont.offset().top + elem.outerHeight()
			});
		},
		
		_onPopup_destroyed: function() {
			// Дерегистрируем всплываху у себя и из центра по уничтожению
			ValidationCenter.unsetPopup(this._popup);
			this._popup = null;
		},
		/**
		 * Выполняет запуск всех валидаторов, указанных в контроллере
		 */
		validate: function() {
			var firstInvalid, firstResult;
			for( var i = 0; i < this._validators.length; ++i ) {
				var
					vld = this._validators[i],
					result = vld.fn.call(vld.control, vld);
				if( !this._checkResult(result) ) {
					firstInvalid = vld;
					firstResult = result;
				}
				this._markIfValid(result, vld.elem);
			}
			if( firstInvalid ) {
				this._openPopup(this._validationMsg(firstResult), firstInvalid.elem);
			} else {
				this._closePopup();
			}
		}
	}
);
});
