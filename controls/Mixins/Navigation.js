define('fir/controls/Mixins/Navigation', [
	'fir/controls/Paging/Paging',
	'fir/controls/Loader/Serializer'
], function(Paging, LoaderSerializer) {
return FirClass(
	function NavigationMixin() {
		// Название свойста, в которое приходит навигационная информация при постраничном переходе
		this._navProperty = 'nav';
		this._subscr(function() {
			this._getPaging().subscribe('onSetCurrentPage', this._onSetCurrentPage.bind(this));
		});
		this._unsubscr(function() {
			this._getPaging().unsubscribe('onSetCurrentPage');
		});
		this.subscribe('onAfterLoad', this._onNavState_update);
	}, {
		_getPaging: function() {
			var paging = this.getChildByName(this.instanceName() + 'Paging');
			if( !(paging instanceof Paging) ) {
				throw new Error('Expected instance of Paging class');
			}
			return paging;
		},
		getNavParams: function() {
			var
				paging = this._getPaging(),
				PagingMode = paging.PagingMode,
				nav = {};
			switch( paging.getPagingMode() ) {
				case PagingMode.Offset: nav.offset = paging.getOffset(); break;
				case PagingMode.Page: nav.currentPage = paging.getCurrentPage(); break;
			}
			nav.pageSize = paging.getPageSize();
			return nav;
		},
		_onSetCurrentPage: function() {
			if( !this._navigatedArea ) {
				throw new Error('Expected navigated area name');
			}
			this._reloadControl(this._navigatedArea);
		},
		/** Обработчик выполняет обновление навигационного состояния */
		_onNavState_update: function(ev, opts, areaName) {
			if( window.history != null ) {
				var flt = LoaderSerializer.serialize(this._getQueryParams(areaName));
				window.history.replaceState(null, null, '?' + flt);
			}
			var navData = opts[this._navProperty];
			if( !navData ) {
				console.warn('No navigation data is provided or navigation property name is incorrect');
				return;
			}
			this._getPaging().setNavigation(navData || {});
		}
	});
});