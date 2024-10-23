polarity.export = PolarityComponent.extend({
  uniqueIdPrefix: '',
  details: Ember.computed.alias('block.data.details'),
  fields: Ember.computed.alias('details.fields'),
  summaryFields: Ember.computed.alias('details.summaryFields'),
  sessions: Ember.computed.alias('details.sessions'),
  sessionsPaged: Ember.computed.alias('filteredPagingData'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  // Session Paging Variables
  currentPage: 1,
  pageSize: 5,
  pagingData: Ember.computed.alias('sessions'),
  isPrevButtonsDisabled: Ember.computed('currentPage', function () {
    return this.get('currentPage') === 1;
  }),
  isNextButtonDisabled: Ember.computed(
      'pagingData.length',
      'pageSize',
      'currentPage',
      function () {
        const totalResults = this.get('pagingData.length');
        const totalPages = Math.ceil(totalResults / this.get('pageSize'));
        return this.get('currentPage') === totalPages;
      }
  ),
  pagingStartItem: Ember.computed('currentPage', 'pageSize', function () {
    return (this.get('currentPage') - 1) * this.get('pageSize') + 1;
  }),
  pagingEndItem: Ember.computed('pagingStartItem', function () {
    return this.get('pagingStartItem') - 1 + this.get('pageSize');
  }),
  filteredPagingData: Ember.computed('pageSize', 'currentPage', function () {
    const startIndex = (this.get('currentPage') - 1) * this.get('pageSize');
    const endIndex = startIndex + this.get('pageSize');

    return this.get('pagingData').slice(startIndex, endIndex);
  }),
  // End of Paging Variables
  init() {
    let array = new Uint32Array(5);
    this.set('uniqueIdPrefix', window.crypto.getRandomValues(array).join(''));
    this._super(...arguments);
  },
  actions: {
    prevPage() {
      let currentPage = this.get('currentPage');

      if (currentPage > 1) {
        this.set('currentPage', currentPage - 1);
      }
    },
    nextPage() {
      const totalResults = this.get('pagingData.length');
      const totalPages = Math.ceil(totalResults / this.get('pageSize'));
      let currentPage = this.get('currentPage');
      if (currentPage < totalPages) {
        this.set('currentPage', currentPage + 1);
      }
    },
    firstPage() {
      this.set('currentPage', 1);
    },
    lastPage() {
      const totalResults = this.get('pagingData.length');
      const totalPages = Math.ceil(totalResults / this.get('pageSize'));
      this.set('currentPage', totalPages);
    },
  }
});
