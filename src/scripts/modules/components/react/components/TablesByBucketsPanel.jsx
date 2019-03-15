import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import fuzzy from 'fuzzy';
import { fromJS, List } from 'immutable';
import { Panel } from 'react-bootstrap';
import ActiveCountBadge from './ActiveCountBadge';
import storageActionCreators from '../../StorageActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storageTablesStore from '../../stores/StorageTablesStore';

export default createReactClass({
  mixins: [createStoreMixin(storageTablesStore)],

  propTypes: {
    renderTableRowFn: PropTypes.func.isRequired,
    renderHeaderRowFn: PropTypes.func,
    filterFn: PropTypes.func,
    searchQuery: PropTypes.string,
    isTableExportedFn: PropTypes.func,
    isTableShownFn: PropTypes.func,
    onToggleBucketFn: PropTypes.func,
    isBucketToggledFn: PropTypes.func,
    showAllTables: PropTypes.bool,
    configuredTables: PropTypes.array,
    renderDeletedTableRowFn: PropTypes.func
  },

  getStateFromStores() {
    return { tables: storageTablesStore.getAll() };
  },

  componentDidMount() {
    setTimeout(() => {
      storageActionCreators.loadTables().then(() => {
        // force expand of the first bucket if is the only one
        const tables = storageTablesStore.getAll();
        const buckets = this._getFilteredBuckets(tables);
        const forceExpand = buckets.count() === 1;

        if (forceExpand) {
          const bucketId = buckets.keySeq().first();

          if (!this._isBucketToggled(bucketId)) {
            this.props.onToggleBucketFn(bucketId);
          }
        }
      });
    });
  },

  getDefaultProps() {
    return {
      showAllTables: true,
      configuredTables: []
    };
  },

  render() {
    const deletedTables = this._getDeletedTables();
    const buckets = this._getFilteredBuckets();

    if (!buckets.count()) {
      return this._renderNotFound();
    }

    return (
      <div>
        <div className="kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table">
          {buckets
            .map((bucket, bucketId) => {
              return this._renderBucketPanel(bucketId, bucket.get('tables'));
            })
            .toArray()}
        </div>
        {deletedTables.count() > 0 && (
          <div>
            <div className="kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table">
              {this._renderBucketPanel('Nonexisting tables', deletedTables, this.props.renderDeletedTableRowFn)}
            </div>
          </div>
        )}
      </div>
    );
  },

  _renderBucketPanel(bucketId, tables, renderRowFn = this.props.renderTableRowFn) {
    const activeCount = this.props.isTableExportedFn
      ? tables.filter(table => this.props.isTableExportedFn(table.get('id'))).count()
      : 0;

    const header = (
      <span>
        <span className="table">
          <span className="tbody">
            <span className="tr">
              <span className="td">{bucketId}</span>
              {this.props.isTableExportedFn && (this.props.showAllTables || this.props.isTableShownFn) && (
                <span className="td text-right">
                  <ActiveCountBadge totalCount={tables.size} activeCount={activeCount} />
                </span>
              )}
            </span>
          </span>
        </span>
      </span>
    );

    return (
      <Panel
        header={header}
        key={bucketId}
        eventKey={bucketId}
        expanded={!!(this.props.searchQuery && this.props.searchQuery.length) || this._isBucketToggled(bucketId)}
        collapsible={true}
        onSelect={this._handleBucketSelect.bind(this, bucketId)}
      >
        {this._renderTablesList(tables, renderRowFn)}
      </Panel>
    );
  },

  _renderTablesList(tables, renderRowFn) {
    const childs = tables.map((table, index) => renderRowFn(table, index), this).toArray();

    let header = this.props.renderHeaderRowFn ? this.props.renderHeaderRowFn(tables) : this._renderDefaultHeaderRow();

    return (
      <div className="row">
        <div className="table table-striped table-hover table-no-margin">
          {header && (
            <div className="thead" key="table-header">
              {header}
            </div>
          )}
          <div className="tbody kbc-break-all kbc-break-word">
            {childs}
          </div>
        </div>
      </div>
    );
  },

  _renderDefaultHeaderRow() {
    return (
      <div className="tr">
        <span className="th">
          <strong>Table name</strong>
        </span>
      </div>
    );
  },

  _getTablesByBucketsList(tables) {
    const groupedBuckets = tables.groupBy(value => value.getIn(['bucket', 'id']));

    return groupedBuckets
      .map(bucketTables => {
        const firstTable = bucketTables.first();
        const bucket = firstTable.get('bucket');
        return bucket.set('tables', bucketTables.toList());
      })
      .mapKeys((key, bucket) => bucket.get('id'));
  },

  _isBucketToggled(bucketId) {
    return this.props.isBucketToggledFn(bucketId);
  },

  _handleBucketSelect(bucketId, eventKey, e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onToggleBucketFn(bucketId);
  },

  _renderNotFound() {
    return (
      <div className="table table-striped">
        <div className="tfoot">
          <div className="tr">
            <div className="td">No tables found</div>
          </div>
        </div>
      </div>
    );
  },

  // load buckets and tables from storage store and filter them
  _getFilteredBuckets(allTables) {
    let tables = allTables;
    let filteredBuckets;
    if (!tables) {
      tables = this.state.tables || List();
    }
    const buckets = this._getTablesByBucketsList(tables);

    if (this.props.filterFn) {
      filteredBuckets = this.props.filterFn(buckets);
    } else {
      filteredBuckets = buckets;
    }
    // filter according to search query
    filteredBuckets = filteredBuckets.map(bucketObject => {
      return bucketObject.set('tables', this._filterBucketTables(bucketObject));
    });
    filteredBuckets = filteredBuckets.filter(bucket => bucket.get('tables').count() > 0);
    filteredBuckets = filteredBuckets.sortBy(bucket => bucket.get('id').toLowerCase());
    return filteredBuckets;
  },

  _filterBucketTables(bucket) {
    let query = this.props.searchQuery;

    if (!query) {
      query = '';
    }

    let newTables = bucket.get('tables').filter(table => {
      return fuzzy.match(query, table.get('id'));
    });

    if (!this.props.showAllTables || this.props.isTableShownFn) {
      newTables = newTables.filter(table => {
        const tableId = table.get('id');
        const isShown = this.props.isTableShownFn ? this.props.isTableShownFn(tableId) : false;
        const isExported = this.props.isTableExportedFn(tableId);
        return isExported || isShown;
      });
    }
    newTables = newTables.sortBy(table => table.get('id').toLowerCase());
    return newTables;
  },

  // return tables that no longer exists but are still in the configuration
  _getDeletedTables() {
    const tables = this.state.tables.keySeq().toJS();
    const result = [];
    for (let configuredTable of this.props.configuredTables) {
      if (!tables.includes(configuredTable)) {
        result.push({
          id: configuredTable
        });
      }
    }
    return fromJS(result);
  }
});
