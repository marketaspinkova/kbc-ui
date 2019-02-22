import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { PanelGroup, Panel, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import { navigateToBucketDetail, setOpenedBuckets } from '../../Actions';
import MarkedText from './MarkedText';

export default React.createClass({
  propTypes: {
    openBuckets: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    expandAllBuckets: PropTypes.bool.isRequired,
    activeBucketId: PropTypes.string,
    searchQuery: PropTypes.string
  },

  render() {
    if (!this.props.buckets.count()) {
      return <p className="kbc-inner-padding">No buckets or tables are matching your criteria.</p>;
    }

    return (
      <PanelGroup className="kbc-accordion">
        {this.props.buckets
          .sortBy((bucket) => bucket.get('id').toLowerCase())
          .map(this.renderBucketPanel)
          .toArray()}
      </PanelGroup>
    );
  },

  renderBucketPanel(bucket) {
    return (
      <Panel
        collapsible
        expanded={this.isPanelExpanded(bucket)}
        className={classnames('storage-panel', { 'is-active': this.props.activeBucketId === bucket.get('id') })}
        header={this.renderBucketHeader(bucket)}
        key={bucket.get('id')}
        onSelect={() => this.onSelectBucket(bucket.get('id'))}
      >
        {this.renderTables(bucket)}
      </Panel>
    );
  },

  renderBucketHeader(bucket) {
    return (
      <div>
        <div className="storage-bucket-header">
          <h4>
            <MarkedText source={bucket.get('id')} mark={this.props.searchQuery} />
          </h4>
          <Tooltip tooltip="Bucket detail" placement="top">
            <Button
              bsStyle="link"
              bsSize="sm"
              onClick={(event) => {
                event.stopPropagation();
                navigateToBucketDetail(bucket.get('id'))
              }}
            >
              <i className="fa fa-fw fa-chevron-right" />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  },

  renderTables(bucket) {
    let tables = this.props.tables.filter((table) => {
      return table.getIn(['bucket', 'id']) === bucket.get('id');
    });

    if (!tables.count()) {
      return <p>No tables.</p>;
    }

    return (
      <ul className="storage-bucket-tables kbc-break-all kbc-break-word">
        {tables
          .sortBy((table) => table.get('name').toLowerCase())
          .map(this.renderTable)
          .toArray()}
      </ul>
    );
  },

  renderTable(table) {
    const bucketId = table.getIn(['bucket', 'id']);
    const tableName = table.get('name');

    return (
      <li key={table.get('id')}>
        <Link
          className="storage-bucket-table-link"
          to="storage-explorer-table"
          params={{ bucketId, tableName }}
        >
          <span className={classnames({ 'is-table-alias': table.get('isAlias', false) })}>
            <MarkedText source={tableName} mark={this.props.searchQuery}  />
          </span>
        </Link>
      </li>
    );
  },

  onSelectBucket(bucketId) {
    const opened = this.props.openBuckets;

    setOpenedBuckets(opened.has(bucketId) ? opened.delete(bucketId) : opened.add(bucketId));
  },

  isPanelExpanded(bucket) {
    if (this.props.expandAllBuckets) {
      return true;
    }

    if (this.props.activeBucketId === bucket.get('id')) {
      return true;
    }

    return this.props.openBuckets.has(bucket.get('id'));
  }
});
