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
    changeTab(sessionIndex, tab) {
      console.info(`Setting ${sessionIndex} to ${tab}`);
      this.set(`sessions.${sessionIndex}.__activeTab`, tab);
      if (tab === 'json' && !this.get(`sessions.${sessionIndex}.__json`)) {
        let json = JSON.stringify(this.get(`sessions.${sessionIndex}.session`), null, 2);
        this.set(`sessions.${sessionIndex}.__json`, this.syntaxHighlight(json));
      }
    },
    copyData: function (sessionIndex) {
      Ember.run.scheduleOnce(
        'afterRender',
        this,
        this.copyElementToClipboard,
        `arkime-${sessionIndex}-${this.get('uniqueIdPrefix')}`
      );

      Ember.run.scheduleOnce('destroy', this, this.restoreCopyState, sessionIndex);
    }
  },
  copyElementToClipboard(element) {
    window.getSelection().removeAllRanges();
    let range = document.createRange();

    range.selectNode(
      typeof element === 'string' ? document.getElementById(element) : element
    );
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  },
  restoreCopyState(sessionIndex) {
    this.set(`sessions.${sessionIndex}.__showCopyMessage`, true);

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.set(`sessions.${sessionIndex}.__showCopyMessage`, false);
      }
    }, 2000);
  },
  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }
});
