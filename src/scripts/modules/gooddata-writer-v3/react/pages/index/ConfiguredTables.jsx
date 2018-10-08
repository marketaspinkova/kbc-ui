import React, {PropTypes} from 'react';
import {SearchBar} from '@keboola/indigo-ui';
import RoutesStore from '../../../../../stores/RoutesStore';
// import classnames from 'classnames';

import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import Tooltip from '../../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';


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
    return {query: ''};
  },

  renderTable() {
    return (
      <div className="table-config-rows table table-striped">
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th"> <strong>Table Name</strong> </span>
            <span className="th"> <strong>GoodData Title</strong></span>
            <span className="th" />
          </div>
        </div>
        <div className="tbody" ref="list">
          {this.props.tables.map(this.renderTableRow).toArray()}
        </div>
      </div>
    );
  },

  renderTableRow(table, tableId) {
    const router = RoutesStore.getRouter();
    return (
      <div className="tr" key={tableId}
        onClick={() =>  router.transitionTo('keboola.gooddata-writer-table', {config: this.props.configurationId, table: tableId})
        }
      >
        <div className="td">
          {tableId}
        </div>
        <div className="td">
          {table.get('title')}
        </div>
        <div className="td text-right kbc-no-wrap">
          {this.renderRowActionButtons(tableId, table)}
        </div>
      </div>
    );
  },

  renderDeleteButton(tableId) {
    const isPending = this.props.isTablePending([tableId, 'delete']);
    return (
      <Tooltip placement="top" tooltip="delete">
        <button disabled={this.props.isSaving}
          className="btn btn-link" onClick={() => this.props.deleteTable(tableId)}>
          { isPending
            ? <Loader className="fa-fw"/>
            : <i className="kbc-icon-cup fa fa-fw"/>
          }
        </button>
      </Tooltip>
    );
  },

  renderRowActionButtons(tableId, table) {
    const isDisabled = table.get('disabled');
    return [
      this.renderDeleteButton(),
      <ActivateDeactivateButton
        key="activate"
        activateTooltip="Enable"
        deactivateTooltip="Disable"
        isActive={!isDisabled}
        isPending={this.props.isTablePending([tableId, 'activate'])}
        onChange={val => this.props.toggleTableExport(tableId, val)}
      />,
      <RunComponentButton
        key="run"
        title="Run"
        component="keboola.gooddata-writer"
        runParams={this.props.getSingleRunParams}
      >
        {this.renderRunModalContent(tableId, table)}
      </RunComponentButton>
    ];
  },

  renderRunModalContent(tableId, table) {
    if (table.get('disabled')) {
      return 'You are about to run ' + tableId + '. Configuration ' + tableId + ' is disabled and will be forced to run ';
    } else {
      return 'You are about to run load of' + tableId + ' table.';
    }
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
