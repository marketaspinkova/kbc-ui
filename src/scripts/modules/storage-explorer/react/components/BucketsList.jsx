import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Panel, Button } from 'react-bootstrap';
import RoutesStore from '../../../../stores/RoutesStore';

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.buckets.count()) {
      return <p>No buckets found.</p>;
    }

    return <div>{this.props.buckets.map(this.renderBucketPanel).toArray()}</div>;
  },

  renderBucketPanel(bucket) {
    return (
      <Panel header={this.renderBucketHeader(bucket)} key={bucket.get('id')} collapsible={true}>
        {this.renderTables(bucket)}
      </Panel>
    );
  },

  renderBucketHeader(bucket) {
    return (
      <h4>
        <div className="pull-right">
          <Button
            bsSize="small"
            className="btn btn-link"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.goToBucketDetail(bucket);
            }}
          >
            <i className="fa fa-fw fa-chevron-right" />
          </Button>
        </div>
        {bucket.get('id')}
      </h4>
    );
  },

  renderTables(bucket) {
    const tables = this.props.tables.filter(table => {
      return table.getIn(['bucket', 'id']) === bucket.get('id');
    });

    if (!tables.count()) {
      return <p>No tables.</p>;
    }

    return tables.map(this.renderTable).toArray();
  },

  renderTable(table) {
    const bucketId = table.getIn(['bucket', 'id']);
    const tableName = table.get('name');

    return (
      <Link to="storage-explorer-table" params={{ bucketId, tableName }} key={table.get('id')}>
        <p>{tableName}</p>
      </Link>
    );
  },

  goToBucketDetail(bucket) {
    RoutesStore.getRouter().transitionTo('storage-explorer-bucket', {
      bucketId: bucket.get('id')
    });
  }
});
