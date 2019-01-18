import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { Accordion, Panel, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import { navigateToBucketDetail } from '../../Actions';

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.buckets.count()) {
      return <p className="kbc-inner-padding">No buckets found.</p>;
    }

    return (
      <Accordion className="kbc-accordion">
        {this.props.buckets
          .sortBy(bucket => bucket.get('id').toLowerCase())
          .map(this.renderBucketPanel)
          .toArray()}
      </Accordion>
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
            <Button
              bsStyle="link"
              bsSize="sm"
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
      <ul className="list-unstyled">
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
      <li>
        <Link
          className={classnames({ alias: table.get('isAlias', false) })}
          to="storage-explorer-table"
          params={{ bucketId, tableName }}
          key={table.get('id')}
        >
          {tableName}
        </Link>
      </li>
    );
  }
});
