define('fir/controls/Paging/Paging', [
	'fir/controls/FirControl',
	'fir/common/helpers',
	'fir/controls/Paging/Paging.scss'
], function(FirControl, helpers) {
	var PagingMode = {
		Offset: 0,
		Page: 1
	};
return FirClass(
	function Paging(opts) {
		this.superproto.constructor.call(this, opts);
		this._formField = opts.formField;
		this._pageSizeFormField = opts.pageSizeFormField;

		// Пытаемся определить тип постраничной нафигации на основе того, какая опция задана.
		// По-умолчанию предполагаем режим с использованием offset (сдвига по записям)
		if( opts.currentPage != null ) {
			this.setPagingMode(PagingMode.Page);
		} else {
			this.setPagingMode(PagingMode.Offset);
		}
		this.setPageSize(opts.pageSize);

		this._elems('firstBtn').on('click', this.gotoFirst.bind(this));
		this._elems('prevBtn').on('click', this.gotoPrev.bind(this));
		this._elems('nextBtn').on('click', this.gotoNext.bind(this));
		this._elems('lastBtn').on('click', this.gotoLast.bind(this));
		this._elems('gotoPageBtn').on('click', this.gotoPage.bind(this));

		this._setButtonsVisibility();
	}, FirControl, {
		PagingMode: PagingMode,

		/** Переход на первую страницу */
		gotoFirst: function() {
			this.setCurrentPage(0);
		},
		/** Переход на последнюю страницу */
		gotoLast: function() {
			var pageCount = this.getPageCount();
			this.setCurrentPage(pageCount? pageCount - 1: 0);
		},
		/** Переход на предыдущую страницу */
		gotoPrev: function() {
			var page = this.getCurrentPage();
			this.setCurrentPage(page? page - 1: 0);
		},
		/** Переход на следующую страницу */
		gotoNext: function() {
			var page = this.getCurrentPage();
			this.setCurrentPage(page? page + 1: 1);
		},
		/** Переход на указанную пользователем в поле ввода страницу */
		gotoPage: function() {
			var userPageNum = parseInt(this._elems('currentPageField').val(), 10);
			this.setCurrentPage(userPageNum && userPageNum > 1? userPageNum - 1: 0);
		},
		/**
		 * Переход на страницу pageNum
		 * @param {number} pageNum - номер страницы (начинаются с 0)
		 */
		setCurrentPage: function(pageNum) {
			if( pageNum == null ) {
				pageNum = 0;
			}
			if( !helpers.isUnsigned(pageNum) ) {
				throw new Error('Expected non-negative integer as page number');
			}
			this._elems('pageHiddenField').val(pageNum);
			this._elems('offsetField').val(pageNum * this.getPageSize());
			// Хотя роботам это не понять, но пользователи привыкли, что номера страниц начинаются с 1
			this._elems('currentPageField').val(this.getCurrentPage() + 1);

			this._renderNavData(this.getNavigation());
			this._setButtonsVisibility();
			this._notify('onSetCurrentPage', this.getNavParams());

			var closestForm = this._getContainer().closest('form');
			if( this._formField && closestForm.length ) {
				closestForm[0].submit();
			}
		},
		/** Получить номер текущей страницы (начинаются с 0)*/
		getCurrentPage: function() {
			var page;
			if( this._mode == PagingMode.Page ) {
				page = parseInt(this._elems('pageHiddenField').val(), 10);
			} else {
				page = Math.floor(parseInt(this._elems('offsetField').val(), 10) / this.getPageSize());
			}
			return isNaN(page)? null: page;
		},
		getOffset: function() {
			var offset;
			if( this._mode == PagingMode.Page ) {
				offset = parseInt(this._elems('pageHiddenField').val()) * this.getPageSize();
			} else {
				offset = parseInt(this._elems('offsetField').val(), 10);
			}
			return isNaN(offset)? null: offset;
		},
		/** Получить число страниц */
		getPageCount: function() {
			var page = parseInt(this._elems('pageCount').text(), 10);
			return isNaN(page)? null: page;
		},
		getRecordCount: function() {
			var count = parseInt(this._elems('recordCount').text(), 10);
			return isNaN(count)? null: count;
		},
		getPageSize: function() {
			var pageSize = parseInt(this._elems('pageSizeField').val(), 10);
			return isNaN(pageSize)? null: pageSize;
		},
		setPagingMode: function(mode) {
			if( ![PagingMode.Page, PagingMode.Offset].includes(mode) ) {
				throw new Error('Invalid navigation mode: ' + mode);
			}
			this._mode = mode;
			switch(this._mode) {
				case PagingMode.Offset: {
					this._elems('pageHiddenField').attr('name', null);
					this._elems('offsetField').attr('name', this._formField);
					break;
				}
				case PagingMode.Page: {
					this._elems('pageHiddenField').attr('name', this._formField);
					this._elems('offsetField').attr('name', null);
					break;
				}
				default: break;
			}
		},
		/** Возвращает используемый способ постраничной навигации */
		getPagingMode: function() {
			return this._mode;
		},
		setPageSize: function(pageSize) {
			if( pageSize == null ) {
				pageSize = 10; // Размер страницы по умолчанию
			}
			if( !helpers.isUnsigned(pageSize) || pageSize === 0) {
				throw new Error('Expected positive integer as page size');
			}
			this._elems('pageSizeField').val(pageSize);
			if( this.pageSizeFormField ) {
				this._elems('pageSizeField').attr('name', this.pageSizeFormField);
			}
		},
		/**
		 * Метод, который нужно вызывать для установки навигационного состояния
		 * @param {object} nav - состояние навигации
		 * 	recordCount - число записей, по которым идёт навигация
		 * 	pageSize - размер страницы (не кол-во записей на текущей странице), возвращённый сервером 
		 * 	currentPage - номер текущей страницы (нумерация начинается с 0)
		 * 	offset - индекс первой записи страницы в списке записей, по которым идёт навигация (начинается с 0)
		 */
		setNavigation: function(nav) {
			if( nav.pageSize != null ) {
				this.setPageSize(nav.pageSize);
			}

			// Пытаемся уточнить режим постраничной навигации по возвращённой структуре
			if( nav.currentPage != null && nav.offset == null ) {
				this.setPagingMode(PagingMode.Page);
			} else if( nav.offset != null ) {
				this.setPagingMode(PagingMode.Offset);
			} // else: Режим навигации не изменился

			// Обновляем значения основных полей изходя из полученной стуктуры навигации,
			// либо используя старые значения, если в структуре не соотв. полей
			if (nav.currentPage != null) {
				if( !helpers.isUnsigned(nav.currentPage) ) {
					throw new Error('Current page number expected to be non-negative integer');
				}
				this._elems('pageHiddenField').val(nav.currentPage);
			} else {
				this._elems('pageHiddenField').val((this.getCurrentPage() || 0) + 1);
			}
			if (nav.offset != null) {
				if( !helpers.isUnsigned(nav.offset) ) {
					throw new Error('Navigation offset expected to be non-negative integer');
				}
				this._elems('offsetField').val(nav.offset);
			} else {
				this._elems('offsetField').val((this.getOffset() || 0) + this.getPageSize());
			}

			this._renderNavData(nav);
			this._setButtonsVisibility();
		},
		getNavigation: function() {
			var nav = this.getNavParams();
			nav.recordCount = this.getRecordCount();
			nav.pageCount = this.getPageCount();
			return nav;
		},
		getNavParams: function() {
			var nav = {};
			switch(this._mode) {
				case PagingMode.Offset: nav.offset = this.getOffset(); break;
				case PagingMode.Page: nav.currentPage = this.getCurrentPage(); break;
				default: break;
			}
			nav.pageSize = this.getPageSize();
			return nav
		},
		_renderNavData: function(nav) {
			var
				page = this.getCurrentPage(),
				pageSize = this.getPageSize();
			this._elems('currentPageField').val(page? page + 1: 1);
			if( nav.pageCount != null ) {
				if( !helpers.isUnsigned(nav.pageCount) ) {
					throw new Error('Page count expected to be non-negative integer');
				}
				this._elems('pageCount').text(nav.pageCount);
			} else if( nav.recordCount != null && pageSize ) {
				if( !helpers.isUnsigned(nav.recordCount) ) {
					throw new Error('Page count expected to be non-negative integer');
				}
				this._elems('pageCount').text(Math.ceil(nav.recordCount / pageSize));
			}

			this._elems('recordCount').text(nav.recordCount);
		},
		_setButtonsVisibility: function() {
			var
				page = this.getCurrentPage(),
				pageCount = this.getPageCount(),
				recordCount = this.getRecordCount(),
				isFirstVisible = (page != null && page < 1? 'hidden': 'visible'),
				isLastVisible = (page != null && pageCount != null && page + 1 >= pageCount? 'hidden': 'visible');
			this._elems('prevBtn').css('visibility', isFirstVisible);
			this._elems('firstBtn').css('visibility', isFirstVisible);
			this._elems('nextBtn').css('visibility', isLastVisible);
			this._elems('lastBtn').css('visibility', isLastVisible);

			if( recordCount == null ) {
				this._elems('notFoundMsg').hide();
				this._elems('recordCountMsg').hide();
			} else if( recordCount > 0 ) {
				this._elems('notFoundMsg').hide();
				this._elems('recordCountMsg').show();
			} else {
				this._elems('notFoundMsg').show();
				this._elems('recordCountMsg').hide();
			}
		}
});
});