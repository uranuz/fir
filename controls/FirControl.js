define('fir/controls/FirControl', [
	'fir/common/globals',
	'fir/common/base64',
	'fir/common/text_encoder',
], function(globals, Base64, TextEncoder) {
	var
		controlCounter = 0, // Variable used to generate control names
		controlRegistry = {};
	return __mixinProto(function FirControl(opts) {
		if (opts.instanceName) {
			this._instanceName = opts.instanceName;
		} else {
			this._instanceName = 'firControl' + ++controlCounter;
		}

		this._container = opts.container;
		this._childControls = opts.childControls;
		this._cssBaseClass = opts.cssBaseClass;
		this._cssClass = opts.cssClass;
		this._registerControl(this); // Компонент сам себя регистрирует
	}, {
		/// Возвращает имя экземпляра компонента интерфейса
		instanceName: function() {
			return this._instanceName;
		},

		/// Возвращает основной CSS класс, используемый для стилизации компонента
		cssBaseClass: function() {
			return this._cssBaseClass;
		},

		/// Возвращает дополнительные CSS классы для стилизации компонента, добавляемые пользователем
		cssClass: function() {
			return this._cssClass;
		},

		/// Возвращает HTML-класс экземпляра компонента интерфейса
		instanceHTMLClass: function() {
			return this._instanceName? 'i-' + this._instanceName: undefined;
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
		_elemFullClass: function(el) {
			var cls = "e-" + el + " "
			if( this._instanceName ) {
				cls += "i-" + this._instanceName + " ";
			}
			if( this._cssBaseClass ) {
				cls += this._cssBaseClass + " "
			}
			if( this._cssClass ) {
				cls += this._cssClass + " "
			}
			return cls;
		},
		/// Получить класс для выборки элемента по имени elemName
		_elemClass: function(elemName) {
			return '.' + this.instanceHTMLClass() + '.e-' + elemName;
		},
		/// Получить jQuery элемент этого компонента по имени elemName
		_elems: function(elemName) {
			return this._container.find(this._elemClass(elemName)).addBack(this._elemClass(elemName));
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
				self._initControlAndChildren({
					controlTag: $(controlTag)
				});
			});
		},
		_unsubscribeInternal: function() {},
		_subscribeInternal: function() {},
		_getRequestURI: function() {
			return '';
		},
		_getQueryParams: function() {
			return '';
		},
		_getBodyParams: function() {
			return '';
		},
		_updateControlState: function(opts) {},

		/**
		 * Перезагрузка компонента для обновления отображения и внутреннего состояния.
		 * Предполагается, что при этом компонент полностью не уничтожается, а обновляется, например, вёрстка
		 * (либо какая-то её часть, которая может измениться), обновляются какие-то поля данных и т.п.
		 * Могут при этом полностью пересоздаваться дочерние компоненты, если это соответствует логике работы.
		 * При этом должны сохраняться внешние подписки на события, публикуемые этим компонентом,
		 * однако подписки на события вёрстки и дочерних компонентов будут удаляться в "_unsubscribeInternal"
		 * и воссоздаваться заново (если это необходимо) в "_subscribeInternal".
		 * По сути механизм перезагрузки представляет собой каркас для реализации перезагрузки автором компонента
		 * 
		 * @param areaName {string|null|undefined} Название обновляемой области внутри компонента.
		 * Если не указано, то предполагается полное обновление всего компонента
		 */
		_reloadControl: function(areaName) {
			var
				self = this,
				queryParams = this._getQueryParams(areaName);
			this._unsubscribeInternal();
			$.ajax(this._getRequestURI(areaName) + (queryParams? '?' + queryParams: ''), {
				success: function(html) {
					var
						newMarkup = $(html),
						selector = '.' + self.instanceHTMLClass();
					self._initControlAndChildren({
						controlTag: newMarkup.find(selector).addBack(selector).filter(function(index, childTag) {
							return $(childTag).parents(newMarkup, selector).length == 0
						}),
						control: self,
						replaceMarkup: true,
						areaName: areaName
					});
				},
				error: function(error) {
					console.error(error);
				}
			});
		},

		_onControlModuleLoaded: function(state, ControlClass) {
			var
				parentState = state.parentState,
				updateControl = true;
			// К этому моменту дочерние компоненты уже загрузились
			if( state.control == null ) {
				state.opts.container = $(state.controlTag); // Устанавливаем корневой тэг для компонента
				state.opts.childControls = state.childControls; // Прописываем контролы всей пачкой (**)
				state.control = new ControlClass(state.opts);
				state.control._subscribeInternal();
				updateControl = false;
			}

			if( parentState != null ) {
				// Добавляем наш компонент в список дочерних для родителя
				// Если компонент - корневой, то parentState == null
				if( parentState.control == null ) {
					// Родительский контрол не указан - добавляем просто в список, который потом добавляется в строке (**)
					parentState.childControls.push(state.control);
				} else {
					// Есть родительский контрол - добавляем ещё не существующие дочерние к нему
					var existingInst = parentState.control.getChildInstanceByName(state.opts.instanceName);
					if( !existingInst ) {
						parentState.control._childControls.push(existingInst);
					}
				}
			}

			if( updateControl ) {
				// Выполняем обновление состояния, когда уже добавили к родителю (на всякий случай)
				if (!state.areaName) {
					// Если название области для обновления не указано, то обновлялась вся вёрстка компонента,
					// поэтому прописываем новый корневой тег в _container
					state.control._container = $(state.controlTag);
				}
				state.control._updateControlState(state.opts);
				state.control._subscribeInternal();
			}

			// Публикуем событие о завершении загрузки компонента
			state.control._notify('onAfterLoad');

			if( parentState != null && --(parentState.childLoadCounter) === 0 ) {
				// Все компоненты родителя подгрузились - инициализируем его
				this._initCurrentControl(parentState);
			}
		},

		_extractControlOpts: function(rawOpts) {
			var decodedOpts;
			if( rawOpts ) {
				decodedOpts = Base64.decodeUTF8(rawOpts);
				return JSON.parse(decodedOpts);
			}
			return {};
		},

		_initCurrentControl: function(state) {
			require([state.moduleName], this._onControlModuleLoaded.bind(this, state));
		},

		_getChildControlTags: function(controlTag) {
			return $(controlTag).find('[data-fir-module]').filter(function(index, childTag) {
				// Выбираем элементы для которых ближайшим родителем является controlTag
				return $(childTag).parent().closest('[data-fir-module]').is(controlTag);
			});
		},
		_fillControlStateFromMarkup: function(state) {
			if( state.moduleName ) {
				return state;
			}
			state.configTag = $(state.controlTag).find('[data-fir-opts]').filter(function(index, childTag) {
				return $(childTag).closest('[data-fir-module]').is(state.controlTag);
			});
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error('Expected exactly 1 element as control tag!!!');
			}
			if( state.configTag.length > 1 ) {
				throw new Error('Multiple "opts" tags found for control!!!');
			}
			state.moduleName = $(state.controlTag).attr('data-fir-module');
			state.opts = this._extractControlOpts(state.configTag.attr('data-fir-opts'));
			state.childControlTags = this._getChildControlTags(state.controlTag);
			state.childLoadCounter = state.childControlTags.length;
			if( state.control == null ) {
				state.childControls = []; // Список дочерних для текущего компонента
			}
			return state;
		},
		/** Обновление вёрстки компонента при его перезагрузке */
		_updateControlMarkup: function(state) {
			// Замена старой верстки компонента на новую
			// TODO: Нужно проверить, что это не дочерний компонент внутри новой вёрстки,
			// которую не нужно заменять, поскольку она уже будет заменена
			state.control._container.replaceWith(state.controlTag);
		},

		_initControlAndChildren: function(state) {
			var
				self = this,
				childStates = [],
				childrenExist = {};
			this._fillControlStateFromMarkup(state);
			state.childControlTags.each(function(index, childTag) {
				childStates.push(self._fillControlStateFromMarkup({
					controlTag: $(childTag),
					parentState: state
				}));
				childrenExist[childStates[index].opts.instanceName] = true;
			});
			if( state.control ) {
				var childControls = state.control._childControls;
				// Лучше будем удалять с конца, чтобы не было проблем с возможным смещением индексов
				for( var j = childControls.length - 1; j > 0; --j ) {
					if( !childrenExist[ childControls[j] ] ) {
						// При перезагрузке компонентов вызываем уничтожение тех компонентов в старой верстке,
						// которых нет в новой верстке.
						childControls[j].destroy();
						childControls.splice(j, 1); // Нужно убрать пустые элементы из массива дочерних
					}
				}
			}
			if( state.control && state.replaceMarkup ) {
				this._updateControlMarkup(state);
			}
			if( state.childLoadCounter === 0 ) {
				// Нет дочерних компонентов - инициализируем сразу, иначе асинхронно
				this._initCurrentControl(state);
			}
			for( var i = 0; i < childStates.length; ++i ) {
				self._initControlAndChildren(childStates[i]); // Инициализируем дочерние компоненты
			}
		},
		_registerControl: function(control) {
			if( controlRegistry[control.instanceName()] ) {
				throw Error('Control with name "' + control.instanceName() + '" already registered!');
			}
			controlRegistry[control.instanceName()] = control;
		},
		findInstanceByName: function(instanceName) {
			return controlRegistry[instanceName];
		},
		getChildInstanceByName: function(name) {
			for( var i = 0; i < this._childControls.length; ++i ) {
				if( this._childControls[i].instanceName() === name ) {
					return this._childControls[i];
				}
			}
			return null;
		},
		// Уничтожить компонент
		destroy: function() {
			// TODO: Отписаться от всяческих событий
			this._unsubscribeInternal();

			// Прибить дочерние компоненты
			for( var i = 0; i < this._childControls.length; ++i ) {
				this._childControls[i].destroy();
			}

			// Удалить вёрстку этого компонента
			if( this._container ) {
				$(this._container).remove();
			}

			// Дерегистрировать компонент из реестра
			if( controlRegistry[this.instanceName()] === this ) {
				delete controlRegistry[this.instanceName()];
			}
		}
	});
});
