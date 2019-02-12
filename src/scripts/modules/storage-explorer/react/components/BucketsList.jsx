import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { PanelGroup, Panel, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import { navigateToBucketDetail } from '../../Actions';

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    activeBucketId: PropTypes.string
  },

  getInitialState() {
    return {
      activeBucketId: null
    };
  },

  render() {
    if (!this.props.buckets.count()) {
      return <p className="kbc-inner-padding">No buckets found.</p>;
    }

    return (
      <PanelGroup
        accordion
        activeKey={this.state.activeBucketId || this.props.activeBucketId}
        onSelect={this.handleSelect}
        className="kbc-accordion"
      >
        {this.props.buckets
          .sortBy(bucket => bucket.get('id').toLowerCase())
          .map(this.renderBucketPanel)
          .toArray()}
      </PanelGroup>
    );
  },

  renderBucketPanel(bucket) {
    return (
      <Panel
        className="storage-panel"
        header={this.renderBucketHeader(bucket)}
        key={bucket.get('id')}
        eventKey={bucket.get('id')}
      >
        {this.renderTables(bucket)}
      </Panel>
    );
  },

  renderBucketHeader(bucket) {
    return (
      <div>
        <div className="storage-bucket-header">
          <h4>{bucket.get('id')}</h4>
          <Tooltip tooltip="Bucket detail" placement="top">
            <Button bsStyle="link" bsSize="sm" onClick={() => navigateToBucketDetail(bucket.get('id'))}>
              <i className="fa fa-fw fa-chevron-right" />
            </Button>
          </Tooltip>
        </div>
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

    return (
      <ul className="storage-bucket-tables kbc-break-all kbc-break-word">
        {tables
          .sortBy(table => table.get('name').toLowerCase())
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
          className={classnames({ alias: table.get('isAlias', false) })}
          to="storage-explorer-table"
          params={{ bucketId, tableName }}
        >
          {tableName}
        </Link>
      </li>
    );
  },

  handleSelect(bucketId) {
    this.setState({
      activeBucketId: bucketId
    });
  }
});
