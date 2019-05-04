define('fir/controls/Mixins/Navigation', [
	'fir/controls/Pagination/Pagination',
	'fir/controls/Loader/Serializer'
], function(Pagination, LoaderSerializer) {
return new (FirClass(
	function NavigationMixin() {
		// Название свойста, в которое приходит навигационная информация при постраничном переходе
		this._navProperty = 'nav';
	}, {
		_onSubscribe: function() {
			if( this._onSetCurrentPageBinded == null ) {
				this._onSetCurrentPageBinded = this._onSetCurrentPage.bind(this);
			}
			this._getPaging().subscribe('onSetCurrentPage', this._onSetCurrentPageBinded);
		},
		_onUnsubscribe: function() {
			this._getPaging().unsubscribe('onSetCurrentPage', this._onSetCurrentPageBinded);
		},
		_getPaging: function() {
			var paging = this.getChildByName(this.instanceName() + 'Paging');
			if( !(paging instanceof Pagination) ) {
				throw new Error('Expected instance of Pagination class');
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
		_onAfterLoad: function(state) {
			this.superproto._onAfterLoad.apply(this, arguments);
			if( window.history != null ) {
				var flt = LoaderSerializer.serialize(this._getQueryParams());
				window.history.replaceState(null, null, '?' + flt);
			}
			var navData = state.opts[this._navProperty];
			if( !navData ) {
				console.warn('No navigation data is provided or navigation property name is incorrect');
			}
			this._getPaging().setNavigation(navData || {});
		}
	}));
});