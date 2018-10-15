import React from 'react';
import Immutable from 'immutable';
import fuzzy from 'fuzzy';

import TransformationBucketRow from './TransformationBucketRow';
import TransformationsList from './TransformationsList';
import TransformationActionCreators from '../../../ActionCreators';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationBucketsStore from '../../../stores/TransformationBucketsStore';
import TransformationsStore from '../../../stores/TransformationsStore';
import { SearchBar } from '@keboola/indigo-ui';
import EmptyStateIndex from '../../components/EmptyStateIndex';
import { Panel } from 'react-bootstrap';

export default React.createClass({
  mixins: [createStoreMixin(TransformationBucketsStore, TransformationsStore)],

  getStateFromStores() {
    return {
      buckets: TransformationBucketsStore.getAll(),
      toggles: TransformationBucketsStore.getToggles(),
      pendingActions: TransformationBucketsStore.getPendingActions(),
      filter: TransformationBucketsStore.getTransformationBucketsFilter(),
      transformationsInBuckets: TransformationsStore.getAllTransformations(),
      transformationPendingActions: TransformationsStore.getAllPendingActions()
    };
  },

  _handleFilterChange(query) {
    return TransformationActionCreators.setTransformationBucketsFilter(query);
  },

  render() {
    return (
      <div className="container-fluid">
        {this.state.buckets && this.state.buckets.count() > 0 ? (
          <div className="kbc-main-content">
            <div className="row-searchbar">
              <SearchBar onChange={this._handleFilterChange} query={this.state.filter} />
            </div>
            <span>
              {this._getFilteredBuckets().count() ? (
                <div className="kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table">
                  {this._getFilteredBuckets()
                    .map(bucket => {
                      return this._renderBucketPanel(bucket);
                    })
                    .toArray()}
                </div>
              ) : (
                <div className="kbc-header">
                  <div className="kbc-title">
                    <h2>No buckets or transformations found.</h2>
                  </div>
                </div>
              )}
            </span>
          </div>
        ) : (
          <div className="kbc-main-content">
            <EmptyStateIndex />
          </div>
        )}
      </div>
    );
  },

  _renderBucketPanel(bucket) {
    const header = (
      <span>
        <span className="table">
          <TransformationBucketRow
            bucket={bucket}
            pendingActions={this.state.pendingActions.get(bucket.get('id'), Immutable.Map())}
            description={TransformationBucketsStore.get(bucket.get('id')).get('description')}
          />
        </span>
      </span>
    );

    return (
      <Panel
        header={header}
        key={bucket.get('id')}
        eventKey={bucket.get('id')}
        expanded={!!this.state.filter.length || this.state.toggles.getIn([bucket.get('id')])}
        collapsible={true}
        onSelect={this._handleBucketSelect.bind(this, bucket.get('id'))}
      >
        <TransformationsList
          bucket={bucket}
          transformations={this._getFilteredTransformations(bucket.get('id'))}
          pendingActions={this.state.transformationPendingActions.getIn([bucket.get('id')], Immutable.Map())}
        />
      </Panel>
    );
  },

  _handleBucketSelect(bucketId, eventKey, e) {
    e.preventDefault();
    e.stopPropagation();
    return TransformationActionCreators.toggleBucket(bucketId);
  },

  _getFilteredBuckets() {
    let filtered = this.state.buckets;
    if (this.state.filter && this.state.filter !== '') {
      const { filter } = this.state;
      const component = this;
      filtered = this.state.buckets.filter(
        bucket =>
          fuzzy.match(filter, bucket.get('name', '').toString()) ||
          fuzzy.match(filter, bucket.get('id', '').toString()) ||
          fuzzy.match(filter, bucket.get('description', '').toString()) ||
          component._getFilteredTransformations(bucket.get('id')).count()
      );
    }

    return filtered.sortBy(bucket => bucket.get('name').toLowerCase());
  },

  _getFilteredTransformations(bucketId) {
    let filtered = this.state.transformationsInBuckets.getIn([bucketId], Immutable.Map());
    if (this.state.filter && this.state.filter !== '') {
      const { filter } = this.state;
      filtered = this.state.transformationsInBuckets
        .getIn([bucketId], Immutable.Map())
        .filter(
          transformation =>
            fuzzy.match(filter, transformation.get('name', '').toString()) ||
            fuzzy.match(filter, transformation.get('description', '').toString()) ||
            fuzzy.match(filter, transformation.get('fullId', '').toString()) ||
            fuzzy.match(filter, transformation.get('id', '').toString())
        );
    }

    return filtered.sortBy(transformation => {
      // phase with padding
      const phase = `0000${transformation.get('phase')}`.slice(-4);
      const name = transformation.get('name', '');
      return phase + name.toLowerCase();
    });
  }
});