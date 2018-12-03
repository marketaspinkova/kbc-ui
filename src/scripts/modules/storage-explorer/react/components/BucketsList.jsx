import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Panel, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import { navigateToBucketDetail } from '../../Actions';

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
      <div>
        <h4>
          <div className="pull-right">
            <Tooltip tooltip="Bucket detail" placement="top">
              <Button
                className="btn btn-link"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateToBucketDetail(bucket.get('id'));
                }}
              >
                <i className="fa fa-fw fa-chevron-right" />
              </Button>
            </Tooltip>
          </div>
          {bucket.get('id')}
        </h4>
      </div>
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
