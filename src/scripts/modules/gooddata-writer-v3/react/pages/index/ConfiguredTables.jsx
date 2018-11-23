import React, { PropTypes } from 'react';
import { SearchBar } from '@keboola/indigo-ui';
import RoutesStore from '../../../../../stores/RoutesStore';
import StorageApiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
// import classnames from 'classnames';

import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import RunLoadButton from '../../components/RunLoadButton';

import Tooltip from '../../../../../react/common/Tooltip';
import Confirm from '../../../../../react/common/Confirm';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    configurationId: PropTypes.string.isRequired,
    tables: PropTypes.object,
    isSaving: PropTypes.bool,
    isTablePending: PropTypes.func,
    deleteTable: PropTypes.func,
    toggleTableExport: PropTypes.func,
    newTableButton: PropTypes.object,
    getSingleRunParams: PropTypes.func
  },

  getInitialState() {
    return { query: '' };
  },

  renderTable() {
    const filteredRows = this.getFilteredRows();
    return (
      <div className="table-config-rows table table-striped">
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th">
              {' '}
              <strong>Table Name</strong>{' '}
            </span>
            <span className="th">
              {' '}
              <strong>GoodData Title</strong>
            </span>
            <span className="th" />
          </div>
        </div>
        <div className="tbody" ref="list">
          {filteredRows.count() > 0 ? (
            filteredRows.map(this.renderTableRow).toArray()
          ) : (
            <div className="kbc-inner-padding">No results found.</div>
          )}
        </div>
      </div>
    );
  },

  getFilteredRows() {
    const { query } = this.state;
    if (!query) {
      return this.props.tables;
    }

    return this.props.tables.filter((table, tableId) => tableId.match(query) || table.get('title').match(query));
  },

  transitionToTableDetail(tableId) {
    const router = RoutesStore.getRouter();
    router.transitionTo('keboola.gooddata-writer-table', { config: this.props.configurationId, table: tableId });
  },

  renderTableRow(table, tableId) {
    return (
      <div className="tr" key={tableId} onClick={() => this.transitionToTableDetail(tableId)}>
        <div className="td">
          <StorageApiTableLinkEx tableId={tableId} />
        </div>
        <div className="td">{table.get('title')}</div>
        <div className="td text-right kbc-no-wrap">{this.renderRowActionButtons(tableId, table)}</div>
      </div>
    );
  },

  renderDeleteButton(tableId) {
    const isPending = this.props.isTablePending([tableId, 'delete']);
    return (
      <Confirm
        key={`confirm${tableId}`}
        text={`Do you really want to delete table ${tableId} from the confuration?`}
        title={`Delete table ${tableId}`}
        buttonLabel="Delete"
        onConfirm={() => this.props.deleteTable(tableId)}
      >
        <button disabled={this.props.isSaving} className="btn btn-link">
          <Tooltip placement="top" tooltip="delete">
            {isPending ? <Loader className="fa-fw" /> : <i className="kbc-icon-cup fa fa-fw" />}
          </Tooltip>
        </button>
      </Confirm>
    );
  },

  renderRowActionButtons(tableId, table) {
    const isDisabled = table.get('disabled');
    return [
      this.renderDeleteButton(tableId),
      <ActivateDeactivateButton
        key={`activate${tableId}`}
        activateTooltip="Enable load to GoodData project"
        deactivateTooltip="Disable load to GoodData project"
        isActive={!isDisabled}
        isPending={this.props.isTablePending([tableId, 'activate'])}
        onChange={val => this.props.toggleTableExport(tableId, val)}
      />,
      <RunLoadButton
        tableId={tableId}
        isTableDisabled={isDisabled}
        key={`run${tableId}`}
        getRunParams={this.props.getSingleRunParams}
      />
    ];
  },

  onChangeSearch(query) {
    this.setState({ query: query });
  },

  render() {
    return (
      <div>
        <div className="kbc-inner-padding">
          <SearchBar
            query={this.state.query}
            onChange={this.onChangeSearch}
            additionalActions={this.props.newTableButton}
          />
        </div>
        {this.renderTable()}
      </div>
    );
  }
});
