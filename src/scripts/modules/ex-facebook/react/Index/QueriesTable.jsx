import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
// import {List} from 'immutable';

import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';

import Tooltip from '../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';
import StorageTableLink from '../../../components/react/components/StorageApiTableLinkEx';
import {Table} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    accounts: PropTypes.object.isRequired,
    allTables: PropTypes.object.isRequired,
    queries: PropTypes.object.isRequired,
    configId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    deleteQueryFn: PropTypes.func.isRequired,
    onStartEdit: PropTypes.func.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    toggleQueryEnabledFn: PropTypes.func.isRequired,
    getRunSingleQueryDataFn: PropTypes.func.isRequired,
    accountDescFn: PropTypes.func.isRequired,
    addQueryButton: PropTypes.object.isRequired
  },

  render() {
    return (
      <Table striped className="kbc-break-all kbc-break-word">
        <thead className="thead">
          <tr className="tr">
            <th className="th">
              <strong>Query Name</strong>
            </th>
            <th className="th">
              <strong>{this.props.accountDescFn('Pages')} to Extract</strong>
            </th>
            <th className="th">
              {/* right arrow */}
            </th>
            <th className="th">
              <strong>Output Tables</strong>
            </th>
            <th className="th pull-right">
              {this.props.addQueryButton}
              {/* action buttons */}
            </th>
          </tr>
        </thead>
        <tbody className="tbody">
          {this.props.queries.map((q) => this.renderQueryRow(q))}
        </tbody>
      </Table>
    );
  },


  renderQueryRow(query) {
    // const propValue = (propName) => query.getIn([].concat(propName));
    const qname = query.get('name');
    return (
      <tr
        className="tr">
        <td className="td">
          {qname}
        </td>
        <td className="td">
          {this.renderAccounts(query.getIn(['query']))}
        </td>
        <td className="td">
          <i className="kbc-icon-arrow-right" />
        </td>
        <td className="td">
          {this.renderTables(qname)}
        </td>
        <td className="td text-right kbc-no-wrap">
          {this.renderEditButton(query)}
          {this.renderDeleteButton(query)}
          <ActivateDeactivateButton
            activateTooltip="Enable"
            deactivateTooltip="Disable"
            isActive={!query.get('disabled')}
            isPending={this.props.isPendingFn(['toggle', query.get('id')])}
            onChange={() => this.props.toggleQueryEnabledFn(query.get('id'))}
          />
          <RunExtractionButton
            title="Run"
            component={this.props.componentId}
            runParams={ () => {
              return {
                config: this.props.configId,
                configData: this.props.getRunSingleQueryDataFn(query.get('id'))
              };
            }}
          >
            You are about to run an extraction of {qname}.
          </RunExtractionButton>
        </td>
      </tr>
    );
  },

  matchTableToLongestQuery(tableName) {
    const qs = this.props.queries.filter((q) => this.tableIsFromQuery(tableName, q.get('name')));
    return qs.max((qa, qb) => qa.get('name').length > qb.get('name').length);
  },

  tableIsFromQuery(tableName, queryName) {
    return tableName.startsWith(`${queryName}_`) || tableName === queryName;
  },

  renderTables(queryName) {
    const configTables = this.props.allTables.filter((t) => {
      if (t.getIn(['bucket', 'id']) !== this.props.bucketId) return false;
      const tableName = t.get('name');
      const bestMatchQuery = this.matchTableToLongestQuery(tableName);
      return bestMatchQuery && bestMatchQuery.get('name') === queryName;
    }
    );
    if (configTables.count() === 0) return 'n/a';
    return configTables.map((t) => {
      return (
        <div key={t.get('id')}>
          <StorageTableLink tableId={t.get('id')} linkLabel={t.get('name')} />
        </div>
      );
    }).toArray();
  },

  renderAccounts(query) {
    if (!query.has('ids') ) {
      return 'None';
    }
    const ids = query.get('ids');
    if (!ids) {
      return `All ${this.props.accountDescFn('pages')}`;
    }
    return ids.split(', ').map((id) => this.props.accounts.getIn([id, 'name'], id)).join(',');
  },

  renderEditButton(query) {
    return (
      <button className="btn btn-link"
        onClick={() => this.props.onStartEdit(query)}>
        <Tooltip tooltip="Edit" placement="top">
          <i className="kbc-icon-pencil" />
        </Tooltip>
      </button>
    );
  },

  renderDeleteButton(query) {
    const isPending = this.props.isPendingFn(['delete', query.get('id')]);
    if (isPending) {
      return <span className="btn btn-link"><Loader/></span>;
    }
    return (
      <Confirm
        title="Delete query"
        text={`Do you really want to delete the extraction of the query ${query.get('name')}?`}
        buttonLabel="Delete"
        onConfirm={() => this.props.deleteQueryFn(query)}
      >
        <Tooltip placement="top" tooltip="Delete">
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  }

});
