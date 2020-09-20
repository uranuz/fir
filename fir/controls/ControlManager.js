define('fir/controls/ControlManager', [
	'fir/common/base64',
	'fir/common/Deferred',
	'fir/datctrl/Deserializer',
	'fir/datctrl/ivy/Deserializer',
	'fir/controls/Loader/Manager',
	'fir/controls/iface/IControlModuleLoader',
	'fir/common/helpers'
], function(
	Base64,
	Deferred,
	Deserializer,
	IvyDeserializer,
	LoaderManager,
	IControlModuleLoader,
	helpers
) {
	function ControlLoadState() {
		this.controlTag = null; // This control (or area) root tag
		this.opts = null; // Parsed options
		this.moduleName = null; // Path to module of this control
		this.control = null; // This control instance
		this.childStates = []; // List of ControlLoadState instances for child controls
		this.childLoadCounter = null; // Count of remaining child controls that need to be loaded
		this.parentState = null; // Instance of ControlLoadState for parent control
		this.replaceMarkup = null;
		this.areaName = null;
		this.onAfterLoad = null; // Deffered that needs to be called on finish load
		this.optSets = null; // Sets of options that needs to be passed to loaded controls
	}

	ControlLoadState.prototype.getOptSets = function() {
		if( this.optSets != null ) {
			return this.optSets;
		}
		if( this.parentState != null ) {
			return this.parentState.getOptSets();
		}
	}

// ControlManger is singleton. So module returns instance of class
return new (FirClass(
	function ControlManager() {
		this._controlCounter = 0; // Variable used to generate control names
		this._moduleLoader = null;
	}, {
		ControlLoadState: ControlLoadState,

		/** Оживляет все компоненты в данной верстке */
		reviveMarkup: function(newMarkup) {
			// Выбираем корневые компоненты
			helpers.getOuterMost(newMarkup, '[data-fir-module]').each(function(index, controlTag) {
				var newState = new ControlLoadState();
				newState.controlTag = $(controlTag);
				this._initControlAndChildren(newState);
			}.bind(this));
		},

		/** Запускает компоненты в работу после загрузки или обновления верстки */
		reviveControlMarkup: function(newMarkup, state) {
			state = state || new ControlLoadState();
			state.onAfterLoad = new Deferred();
			state.controlTag = helpers.getOuterMost(
				newMarkup,
				(state.control? '.' + state.control.instanceHTMLClass(): '[data-fir-module]')
			);
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error(
					'Expected exactly 1 element as control tag!!! '
					+ 'Check if matching instance class is present on control root element '
					+ 'and there is no multiple root control elements in markup.');
			}
			this._initControlAndChildren(state);
			return state.onAfterLoad;
		},

		_onControlModuleLoaded: function(state, ControlClass) {
			if( !ControlClass && state.control == null ) {
				// Контрол либо уже загружен, либо мы должны получить JS-модуль контрола
				throw new Error('Unable to load JS control module: ' + state.moduleName)
			}
			var
				parentState = state.parentState,
				updateControl = true;
			// Как только сохранили себе локально ссылку на состояние родителя,
			// то удаляем ее из состояния потомка во избежания утечек памяти и возможности обратиться к родителю
			state.parentState = null;

			// К этому моменту дочерние компоненты уже загрузились
			if( state.control == null ) {
				state.opts.container = $(state.controlTag); // Устанавливаем корневой тэг для компонента
				state.opts.childControls = state.childStates.map(function(it) {
					return it.control;
				}); // Прописываем контролы всей пачкой (*#*)
				state.control = new ControlClass(state.opts);
				updateControl = false;
			}

			// Если компонент - корневой в данном процессе загрузки, то parentState == null
			if( parentState != null ) {
				var parentControl = parentState.control;
				// Добавляем наш компонент в список дочерних для родителя
				if( parentControl ) {
					// Есть родительский контрол - добавляем ещё не существующие дочерние к нему
					var existingInst = parentControl.getChildByName(state.opts.instanceName);
					if( !existingInst ) {
						parentControl._childControls.push(state.control);
					}
				}
			}

			if( updateControl ) {
				// Выполняем обновление состояния, когда уже добавили к родителю (на всякий случай)
				if (!state.areaName) {
					// Если название области для обновления не указано, то обновлялась вся вёрстка компонента,
					// поэтому прописываем новый корневой тег компонента
					state.control._container = $(state.controlTag);
				}
				if( state.control._getContainer()[0].parentNode == null ) {
					console.warn(
						'Container for control ' + state.control.instanceName() + ' has no link to parent node. '
						+ 'Old container might been removed from document during update, '
						+ 'but _container property has not been changed properly!'
					);
				}
			}

			state.control._onSubscribe(state.areaName);
			// Публикуем событие о завершении загрузки компонента
			state.control._onAfterLoadInternal(state.areaName, state.opts);
			if( state.onAfterLoad ) {
				// Сообщаем в Deferred о результате
				state.onAfterLoad.resolve(state.control, state.areaName, state.opts);
			}

			if( parentState != null && --(parentState.childLoadCounter) === 0 ) {
				// Все компоненты родителя подгрузились - инициализируем его
				this._initCurrentControl(parentState);
			}
		},

		/** Декодирует опции компонента из base64 */
		_extractControlOpts: function(rawOpts) {
			var decodedOpts;
			if( typeof(rawOpts) == 'string' || (rawOpts instanceof String) ) {
				decodedOpts = Base64.decodeUTF8(rawOpts);
				return JSON.parse(decodedOpts);
			} else if( rawOpts != null ) {
				throw new Error('Expected string or null');
			}
			return {};
		},
		getModuleLoader: function() {
			if( !this._moduleLoader ) {
				throw new Error('Control module loader is required, but not set!');
			}
			return this._moduleLoader;
		},

		setModuleLoader: function(loader) {
			if( !(loader instanceof IControlModuleLoader) ) {
				throw new Error('Expected instance of IControlModuleLoader');
			}
			this._moduleLoader = loader;
		},

		_initCurrentControl: function(state) {
			this.getModuleLoader()
				.load(state.moduleName)
				.then(
					this._onControlModuleLoaded.bind(this, state),
					function(err) {
						console.error('Unable to load module "' + state.moduleName + '"!');
					});
		},
		/** Получает состояние компонента из верстки. Добавляет состояние в контекст перезагрузки state */
		_fillControlStateFromMarkup: function(state) {
			if( state.moduleName ) {
				// Опции уже получены
				return state;
			}
			if( !state.controlTag || state.controlTag.length !== 1 ) {
				throw new Error('Expected exactly 1 element as control tag!!!');
			}
			var configTag = helpers.getOuterMost(state.controlTag, '[data-fir-opts]', '[data-fir-module]', true);
			if( configTag.length > 1 ) {
				throw new Error('Multiple "opts" tags found for control!!!');
			}
			// Определяем имя JS-модуля для контрола
			if( state.control ) {
				if( !state.control._moduleName ) {
					throw new Error('Expected JS-module name for existing control!!!');
				}
				state.moduleName = state.control._moduleName;
			} else {
				state.moduleName = state.controlTag.attr('data-fir-module');
				if( !state.moduleName ) {
					throw new Error('Expected JS-module name for new control!');
				}
			}
			var
				optSets = state.getOptSets(),
				optDataOrId = configTag.attr('data-fir-opts');
			// Если заданы наборы опций, то следует получать опции оттуда. Значит - верстка строится на интерфейсе
			// Если наборы опций не заданы, то опции закодированы в верстке в Base64
			if( optSets != null && optDataOrId ) {
				state.opts = optSets[optDataOrId];
				delete optSets[optDataOrId]; // Избавимся от набора опций сразу как получили его
				IvyDeserializer.unwrapOpts(state.opts); // Извлекает оригинальные значения из адаптеров для ivy
			} else {
				var serializedOpts = this._extractControlOpts(optDataOrId);
				state.opts = Deserializer.deserialize(serializedOpts); // В первой ветке десериализация не нужна
			}
			return state;
		},

		_initControlAndChildren: function(state) {
			var
				self = this,
				existingChildren = {},
				childControlTags = helpers.getOuterMost(state.controlTag.children(), '[data-fir-module]');
			// Заполняем контекст загрузки данного контрола из верстки
			this._fillControlStateFromMarkup(state);
			state.childLoadCounter = childControlTags.length; // Запоминаем сколько контролов надо загрузить

			// Подготавливаем состояние для дочерних компонентов
			childControlTags.each(function(index, childTag) {
				// Создаем контексты загрузки для каждого из дочерних компонентов, найденных в верстке
				var childState = new ControlLoadState();
				childState.controlTag = $(childTag);
				childState.parentState = state;
				self._fillControlStateFromMarkup(childState);
				if( state.control ) {
					// Если дочерний контрол уже существует в текущем,
					// то сохраняем ссылку на него, чтобы он не был создан заново
					childState.control = state.control.getChildByName(childState.opts.instanceName);
				}
				state.childStates.push(childState);
				existingChildren[childState.opts.instanceName] = true;
			});
			if( state.control ) {
				// Уничтожаем компоненты, которых уже нет в новой верстке
				state.control._destroyNonExisentChildControls(state, existingChildren);

				// Отписываемся от событий верстки ровно перед заменой этой верстки,
				// чтобы если что-то отвалилось до этой точки, то события не перестанут работать
				state.control._onUnsubscribe(state.areaName);
				if( state.replaceMarkup ) {
					state.control._updateControlMarkup(state);
				}
			}
			if( state.childLoadCounter === 0 ) {
				// Нет дочерних компонентов - инициализируем сразу, иначе асинхронно
				this._initCurrentControl(state);
				return;
			}
			// Инициализируем дочерние компоненты
			for( var i = 0; i < state.childStates.length; ++i ) {
				self._initControlAndChildren(state.childStates[i]);
			}
		},
		getNextNameIndex: function() {
			return ++this._controlCounter;
		},
		reloadControl: function(control, areaName, extraConfig) {
			var def = new Deferred();
			control._onBeforeLoadInternal(areaName);
			var
				config = control._getReloadOpts(areaName),
				state = new ControlLoadState();
			config.optSets = {};
			state.optSets = config.optSets;
			LoaderManager.load(
				this._mergeConfig(config, extraConfig)
			).then(
				control._onMarkupLoad.bind(control, areaName, state),
				control._onMarkupLoadError.bind(control));
			return def;
		},
		_mergeConfig: function(config, extraConfig) {
			config = config || {};
			if( !extraConfig ) {
				return config;
			}
			for( var key in extraConfig ) {
				if( !extraConfig.hasOwnProperty(key) ) {
					continue;
				}
				if( ['viewParams', 'queryParams', 'bodyParams'].includes(key) ) {
					// Merge method call params and template call params only
					config[key] = config[key] || {};
					var
						inConfig = config[key],
						inExtraConfig = extraConfig[key];
					for( var inKey in inExtraConfig ) {
						if( !inExtraConfig.hasOwnProperty(inKey) ) {
							continue;
						}
						if( typeof(inExtraConfig[inKey]) === 'undefined' ) {
							delete inConfig[inKey];
							continue;
						}
						inConfig[inKey] = inExtraConfig[inKey];
					}
				} else {
					// The rest config params are overwritten
					config[key] = extraConfig[key];
				}
			}
			return config;
		},
		createControl: function(config) {
			if( config == null ) {
				throw new Error('Expected config object');
			}
			var
				def = new Deferred(),
				target = config.target,
				state = new ControlLoadState();
			if( !target ) {
				throw new Error('Required target tag to be replaced by control');
			}
			// Don't want to keep target in opts to reduce leaks;
			config.target = null;
			delete config.target;
			config.optSets = {};
			state.optSets = config.optSets;

			LoaderManager.load(config).then(
				this._onMarkupLoad.bind(this, def, target, state),
				this._onMarkupLoadError.bind(this, def));
			return def;
		},
		/** Коллбэк, вызываемый когда готова верстка созданного шаблона */
		_onMarkupLoad: function(def, target, state, html) {
			var
				target = $(target)[0],
				newMarkup = $(html);
			if( newMarkup.length !== 1 ) {
				throw new Error('Expected exactly one root tag in markup when creating control');
			}
			// Replace specified target node with loaded markup
			target.parentNode.replaceChild(newMarkup[0], target);
			// Revive markup. Get onAfterLoad Deferred as result...
			this.reviveControlMarkup(newMarkup, state).then(
				this._onMarkupRevive.bind(this, def),
				this._onMarkupReviveError.bind(this, def));
		},
		/** Коллбэк, вызываемый когда произошла ошибка при создании верстки шаблона */
		_onMarkupLoadError: function(def, err) {
			console.error(err);
			def.reject(err);
		},
		/** Коллбэк, вызываемый при "оживлении" верстки. Т.е. созданы классы, отвечающие за работу компонента */
		_onMarkupRevive: function(def, control, areaName, opts) {
			def.resolve(control, areaName, opts);
		},
		/** Коллбек, вызываемый при ошибке "оживления" верстки компонента */
		_onMarkupReviveError: function(def, err) {
			def.reject(err);
		}
}));
});
