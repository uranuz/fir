define('fir/controls/FirControl', [
	'fir/controls/ControlManager'
], function(ControlManager) {
return FirClass(
	function FirControl(opts) {
		if (opts.instanceName) {
			this._instanceName = opts.instanceName;
		} else {
			this._instanceName = 'firControl' + ControlManager.getNextNameIndex();
		}

		this._container = opts.container;
		this._childControls = opts.childControls;
		this._cssBaseClass = opts.cssBaseClass;
		this._cssClass = opts.cssClass;
		this._viewModule = opts.__moduleName__;
		this._viewMethod = opts.__scopeName__;
		ControlManager.registerControl(this); // Компонент сам себя регистрирует
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
			return $(this).triggerHandler.call($(this), ev, Array.prototype.slice.call(arguments, 1));
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
		_elems: function(elemName, optional) {
			var
				elemClass = this._elemClass(elemName),
				res = this._getContainer().find(elemClass).addBack(elemClass);
			if( res.length === 0 && !optional ) {
				// Не выбрано элементов по классу. Это нехорошо, если только явно не указано, что они необязательые
				console.log('No elements found by element class: ' + elemClass);
			}
			return res;
		},
		//Возвращает jQuery-список всех элементов компонента
		_allElems: function() {
			return this._getContainer().find('.' + this.instanceHTMLClass());
		},

		// Возвращает корневой элемент компонента
		_getContainer: function() {
			return this._container;
		},

		/**
		 * Адрес для отправки запроса. Если не указано, то используется текущий URI (для REST-запросов).
		 * Либо точка доступа по умолчанию для RPC-запросов
		 */
		_getRequestURI: function(areaName) {
			return '';
		},
		
		/** Предпочитаемый HTTP-метод. Для RPC-запросов не действует */
		_getHTTPMethod: function(areaName) {
			return 'GET';
		},
		
		/** Имя RPC-метода. Если указано, то запрос идет через RPC-протокол */
		_getRPCMethod: function(areaName) {
			return null;
		},

		/** Параметры передаваемые в отображение, но не на основной сервис */
		_getViewParams: function(areaName) {
			return {
				instanceName: this.instanceName()
			};
		}, 
		/**
		 * Параметры, передаваемые на основной сервис, предпочтительно через адресную строку (для REST-запросов)
		 * Но для RPC-вызовов эти параметры добавляются к параметрам метода
		 */
		_getQueryParams: function(areaName) {
			return {};
		},

		/**
		 * Параметры, передаваемые на основной сервис, предпочтительно через тело запроса (для REST-запросов)
		 * Но для RPC-вызовов эти параметры добавляются к параметрам метода
		 */
		_getBodyParams: function(areaName) {
			return {};
		},

		/** Имя модуля (шаблона) интерфейса */
		_getViewModule: function(areaName) {
			if( !areaName ) {
				return this._viewModule;
			}
			var viewModule = this._getAreaElement(areaName).data('fir-view-module');
			return viewModule || this._viewModule;
		},

		/** Имя метода (компонента) интерфейса */
		_getViewMethod: function(areaName) {
			if( !areaName ) {
				return this._viewMethod;
			}
			var viewMethod = this._getAreaElement(areaName).data('fir-view-method');
			if( !viewMethod ) {
				throw new Error(
					'Unable to get view method for area: ' + areaName 
					+ '. Maybe "data-fir-view-method" attribute is missing or area element does not exist');
			}
			return viewMethod;
		},

		_getAreaElement: function(areaName) {
			if( !areaName ) {
				return this._getContainer();
			}
			var areaElement = this._elems(areaName)
			if( !areaElement || !areaElement.length ) {
				throw new Error('Unable to find area element with name: ' + areaName);
			} else if( areaElement.length > 1 ) {
				throw new Error('More than one area element found');
			}
			return areaElement;
		},

		_getReloadOpts: function(areaName) {
			return {
				URI: this._getRequestURI(areaName),
				HTTPMethod: this._getHTTPMethod(areaName),
				RPCMethod: this._getRPCMethod(areaName),
				viewParams: this._getViewParams(areaName),
				queryParams: this._getQueryParams(areaName),
				bodyParams: this._getBodyParams(areaName),
				viewModule: this._getViewModule(areaName),
				viewMethod: this._getViewMethod(areaName),
				// Add success/ error handlers
				success: this._onMarkupLoad.bind(this, areaName),
				error: this._onMarkupLoadError.bind(this, areaName)
			};
		},

		/** Обновление вёрстки компонента при его перезагрузке */
		_updateControlMarkup: function(state) {
			var jAreaNode = this._getAreaElement(state.areaName);

			// Замена старой верстки компонента на новую
			// TODO: Нужно проверить, что это не дочерний компонент внутри новой вёрстки,
			// которую не нужно заменять, поскольку она уже будет заменена
			if( jAreaNode.length && state.controlTag.length ) {
				// Обходим баг в jQuery  replaceWith через родной replaceChild
				// Проблема в том, что jQuery вместо родителя заменяемого элемента берет родителя передаваемого на замену
				$.cleanData(jAreaNode); // Почистим jQuery данные старого контейнера, т.к. это делает jQuery
				jAreaNode[0].parentNode.replaceChild(state.controlTag[0], jAreaNode[0]);
			}
		},

		/**
		 * Обработчик для подписки на события верстки, и динамических дочерних компонентов,
		 * которые могут появляться удаляться при перезагрузке текущего компонента.
		 * Как правило, вместо перекрытия обработчика, нужно использовать событие onSubscribe
		 */
		_onSubscribe: function(areaName) {
			this._notify('onSubscribe', areaName);
		},

		/**
		 * Обработчик отписки от событий верстки при перезагрузке текущего компонента.
		 * Нужно отписываться от событий для избежания накопления обработчиков и утечек памяти.
		 * Для динамических дочерних компонентов отписка происходит автоматом при вызове destroy/
		 * Как правило, вместо перекрытия обработчика, нужно использовать событие onUnsubscribe
		 */
		_onUnsubscribe: function(areaName) {
			this._notify('onUnsubscribe', areaName);
		},

		_onMarkupLoad: function(areaName, html) {
			var state = new ControlManager.ControlLoadState();
			state.control = this;
			state.replaceMarkup = true;
			state.areaName = areaName;
			ControlManager.reviveControlMarkup($(html), state);
		},

		_onMarkupLoadError: function(areaName, error) {
			console.error(error);
		},

		/** Обработчик вызывается перед обновлением компонента */
		_onBeforeLoadInternal: function(areaName) {
			this._notify('onBeforeLoad', areaName);
		},

		/** Обработчик завершения загрузки компонента для переопределения наследниками */
		_onAfterLoadInternal: function(opts, areaName) {
			// Публикуем событие о завершении загрузки компонента
			this._notify('onAfterLoad', opts, areaName);
		},

		/**
		 * Перезагрузка компонента для обновления отображения и внутреннего состояния.
		 * Предполагается, что при этом компонент полностью не уничтожается, а обновляется, например, вёрстка
		 * (либо какая-то её часть, которая может измениться), обновляются какие-то поля данных и т.п.
		 * Могут при этом полностью пересоздаваться дочерние компоненты, если это соответствует логике работы.
		 * При этом должны сохраняться внешние подписки на события, публикуемые этим компонентом,
		 * однако подписки на события вёрстки и дочерних компонентов будут удаляться в "_onUnsubscribe"
		 * и воссоздаваться заново (если это необходимо) в "_onSubscribe".
		 * По сути механизм перезагрузки представляет собой каркас для реализации перезагрузки автором компонента
		 * 
		 * @param areaName {string|null|undefined} Название обновляемой области внутри компонента.
		 * Если не указано, то предполагается полное обновление всего компонента
		 */
		_reloadControl: function(areaName) {
			ControlManager.reloadControl(this, areaName);
		},

		findInstanceByName: function(instanceName) {
			return ControlManager.findInstanceByName(instanceName);
		},
		getChildByName: function(name) {
			for( var i = 0; i < this._childControls.length; ++i ) {
				if( this._childControls[i].instanceName() === name ) {
					return this._childControls[i];
				}
			}
			return null;
		},
		/**
		 * Реализует логику удаления контролов, которые есть в старой верстке, но отстутствуют в новой
		 */
		_destroyNonExisentChildControls: function(state, existingChildren) {
			var
				childControls = state.control._childControls,
				areaElement = (state.areaName && state.replaceMarkup? this._getAreaElement(state.areaName): null);
			if( areaElement && areaElement.length != 1 ) {
				console.warn('Method _getAreaElement probably works wrong!');
			}
			// Будем удалять с конца, чтобы не было проблем со смещением индексов
			for( var j = childControls.length - 1; j > 0; --j ) {
				if( existingChildren[ childControls[j].instanceName() ] ) {
					continue; // Контрол есть в новой верстке
				}
				if( areaElement != null && !areaElement[0].contains(childControls[j]._getContainer()[0]) ) {
					continue; // Мы не должны удалять контролы, корневой тег которых находится вне перезагружаемой области
				}
				childControls[j].destroy();
				childControls.splice(j, 1); // Нужно убрать пустые элементы из массива дочерних
			}
		},

		// Уничтожить компонент
		destroy: function() {
			// TODO: Отписаться от всяческих событий
			this._onUnsubscribe();

			// Прибить дочерние компоненты
			for( var i = 0; i < this._childControls.length; ++i ) {
				this._childControls[i].destroy();
			}

			// Удалить вёрстку этого компонента
			if( this._getContainer() ) {
				$(this._getContainer()).remove();
			}

			// Дерегистрировать компонент из реестра
			ControlManager.unregisterControl(this);
		},

		/** Добавление колбэка, осуществляющего подписку на события */
		_subscr: function(fn) {
			this.subscribe('onSubscribe', fn.bind(this));
		},
		/** Добавление колбэка, осуществляющего отписку от событий */
		_unsubscr: function(fn) {
			this.subscribe('onUnsubscribe', fn.bind(this));
		}
});
});
