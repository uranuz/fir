define('fir/controls/FirControl', [
	'fir/common/globals',
	'fir/common/base64',
	'fir/common/text_encoder',
], function(globals, Base64, TextEncoder) {
	var
		controlCounter = 0, // Variable used to generate control names
		controlRegistry = {}; 
	return __mixinProto(function FirControl(opts) {
		if (opts.controlName) {
			this._controlName = opts.controlName;
		} else {
			this._controlName = 'firControl' + ++controlCounter;
		}
		
		this._controlTypeName = opts.controlTypeName || 'FirControl';
		this._container = opts.container;
		this._childControls = opts.childControls;
		this._registerControl(this); // Компонент сам себя регистрирует
	}, {
		/// Возвращает имя экземпляра компонента интерфейса
		controlName: function() {
			return this._controlName;
		},

		/// Возвращает имя типа компонента интерфейса
		controlTypeName: function() {
			return this._controlTypeName;
		},

		/// Возвращает HTML-класс экземпляра компонента интерфейса
		instanceHTMLClass: function() {
			return this._controlName? 'i-' + this._controlName: undefined;
		},

		/// Подписаться на событие с именем ev с помощью обработчика hdl
		subscribe: function(ev, hdl) {
			return $(this).on.apply($(this), arguments);
		},
		/// Отписаться от события с именем ev
		unsubscribe: function(ev, hdl) {
			return $(this).off.apply($(this), arguments);
		},
		/// Подписка на одно срабатывание события с именем ev с помощью обработчика hdl
		once: function(ev, hdl) {
			return $(this).one.apply($(this), arguments);
		},
		/// Оповестить подписчиков о срабатывании события с именем ev
		_notify: function(ev) {
			return $(this).triggerHandler.apply($(this), arguments);
		},

		/// Получить класс для выборки элемента по имени elemName
		_elemClass: function(elemName) {
			return '.' + this.instanceHTMLClass() + '.e-' + elemName;
		},
		/// Получить jQuery элемент этого компонента по имени elemName
		_elems: function(elemName) {
			return this._container.find(this._elemClass(elemName));
		},
		//Возвращает jQuery-список всех элементов компонента
		_allElems: function() {
			return this._container.find('.' + this.instanceHTMLClass());
		},

		initAllControls: function() {
			var self = this;
			// Выбираем корневые компоненты
			$('[data-fir-module]').filter(function(index, tag) {
				return $(tag).parents('[data-fir-module]').length === 0;
			})
			.each(function(index, controlTag) {
				self._initControlImpl(controlTag);
			});
		},

		_initControlImpl: function(controlTag, parentChildControls) {
			var
				self = this,
				moduleName = $(controlTag).attr('data-fir-module'),
				configTag = $(controlTag).find('[data-fir-opts]').filter(function(index, childTag) {
					return $(childTag).closest('[data-fir-module]').is(controlTag);
				}),
				childControlTags = $(controlTag).find('[data-fir-module]').filter(function(index, childTag) {
					// Выбираем элементы для которых ближайшим родителем является controlTag
					return $(childTag).parent().closest('[data-fir-module]').is(controlTag);
				}),
				childControls = [], // Список дочерних для текущего компонента
				childLoadCounter = childControlTags.length,
				initThis = function() {
					require([moduleName], function(ControlClass) {
						if( configTag.length > 1 ) {
							throw new Error('Multiple "opts" tags found for control!!!');
						}
						var
							rawOpts = configTag.attr('data-fir-opts'),
							decodedOpts, opts = {};
						if (rawOpts) {
							decodedOpts = Base64.decodeUTF8(rawOpts);
							opts = JSON.parse(decodedOpts);
						}
						opts.container = $(controlTag); // Устанавливаем корневой тэг для компонента
						opts.childControls = childControls;
						var control = new ControlClass(opts);
						if( parentChildControls != null ) {
							parentChildControls.push(control); // Добавляем наш компонент в список дочерних для родителя
						}
					});
				};
			

			if( childLoadCounter === 0 ) {
				initThis(); // Нет дочерних компонентов - инициализируем сразу
			}
			childControlTags.each(function(index, childTag) {
				self._initControlImpl(childTag, childControls); // Инициализируем дочерние компоненты
				--childLoadCounter;
				if( childLoadCounter === 0 ) {
					initThis(); // По инициализации последнего дочернего инициализируем и наш
				}
			});
		},
		_registerControl: function(control) {
			if( controlRegistry[control.controlName()] ) {
				throw Error('Control with name "' + control.controlName() + '" already registered!');
			}
			controlRegistry[control.controlName()] = control;
		},
		findControlByName: function(controlName) {
			return controlRegistry[controlName];
		},
		// Уничтожить компонент
		destroy: function() {
			// Прибить дочерние компоненты
			for( var i = 0; i < this._childControls.length; ++i ) {
				this._childControls[i].destroy();
			}
			
			// TODO: Отписаться от всяческих событий

			// Удалить вёрстку этого компонента
			if( this._container ) {
				$(this._container).remove();
			}

			// Дерегистрировать компонент из реестра
			if( controlRegistry[this.controlName()] === this ) {
				delete controlRegistry[this.controlName()];
			}
		}
	});
});
