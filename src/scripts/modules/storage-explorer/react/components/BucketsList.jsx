import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Panel } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.buckets.count()) {
      <p>No buckets found.</p>;
    }

    return <div>{this.props.buckets.map(this.renderBucketPanel).toArray()}</div>;
  },

  renderBucketPanel(bucket) {
    return (
      <Panel header={bucket.get('id')} key={bucket.get('id')} collapsible={true}>
        {this.renderTables(bucket)}
      </Panel>
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
  }
});
