import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';

import Confirm from '../../../../react/common/Confirm';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';

import goodDataWriterStore from '../../store';
import actionCreators from '../../actionCreators';
import { ColumnTypes } from '../../constants';
import TableLoadType from './TableLoadType';

export default createReactClass({
  mixins: [createStoreMixin(goodDataWriterStore), PureRenderMixin],

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const tableId = RoutesStore.getCurrentRouteParam('table');
    const isEditingColumns = goodDataWriterStore.isEditingTableColumns(configId, tableId);
    const writer = goodDataWriterStore.getWriter(configId);

    return {
      projectExist: !!writer.getIn(['config', 'project']),
      pid: writer.getIn(['config', 'project', 'id']),
      table: goodDataWriterStore.getTable(configId, tableId),
      configurationId: configId,
      columns: goodDataWriterStore.getTableColumns(
        configId,
        tableId,
        isEditingColumns ? 'editing' : 'current'
      ),
      isEditingColumns
    };
  },

  _isAllColumnsIgnored() {
    return this.state.columns.reduce((memo, c) => memo && c.get('type') === 'IGNORE', true);
  },

  _handleResetExportStatus() {
    return actionCreators.saveTableField(
      this.state.configurationId,
      this.state.table.get('id'),
      'isExported',
      false
    );
  },

  _handleResetTable() {
    return actionCreators.resetTable(
      this.state.configurationId,
      this.state.table.get('id'),
      this.state.pid
    );
  },

  _handleSynchronizeTable() {
    return actionCreators.synchronizeTable(
      this.state.configurationId,
      this.state.table.get('id'),
      this.state.pid
    );
  },

  _handleUpload() {
    return actionCreators.uploadToGoodData(this.state.configurationId, this.state.table.get('id'));
  },

  _isConnectionPoint() {
    return (
      this.state.columns &&
      this.state.columns.find((c) => c.get('type') === ColumnTypes.CONNECTION_POINT)
    );
  },

  render() {
    const { ATTRIBUTE, REFERENCE, DATE } = ColumnTypes;
    const filteredColumns = this.state.columns.filter(function(c) {
      return [ATTRIBUTE, REFERENCE, DATE].includes(c.get('type'));
    });
    const grainColumns = !this._isConnectionPoint() ? filteredColumns : Map();
    const resetExportStatusText = (
      <span>
        {'Are you sure you want to reset the export status of the '}
        <strong>{this.state.table.getIn(['data', 'title'])}</strong>
        {' dataset?'}
      </span>
    );

    const resetTableText = (
      <span>
        {'You are about to remove the dataset in the GoodData project belonging \
to the table and reset its export status. Are you sure you want to reset the table '}
        <strong>{this.state.table.getIn(['data', 'title'])}</strong>
        {' ?'}
      </span>
    );

    const uploadTableText = (
      <span>
        {'Are you sure you want to upload '}
        {this.state.table.getIn(['data', 'title'])}
        {' to the GoodData project?'}
      </span>
    );

    const synchronizeTableText = (
      <span>
        {'Are you sure you want to execute the '}
        <ExternalLink href="https://developer.gooddata.com/article/maql-ddl#synchronize">
          synchronize
        </ExternalLink>
        {' operation on the '}
        <strong>{this.state.table.getIn(['data', 'title'])}</strong>
        {' dataset?'}
      </span>
    );

    return (
      <div>
        <TableLoadType
          columns={grainColumns}
          table={this.state.table}
          configurationId={this.state.configurationId}
        />{' '}
        <ButtonGroup>
          <DropdownButton
            title=""
            id="modules-gooddata-writer-react-components-table-header-buttons-dropdown"
          >
            <MenuItem>
              <Confirm
                title="Reset export status"
                text={resetExportStatusText}
                buttonLabel="Reset"
                buttonType="success"
                onConfirm={this._handleResetExportStatus}
              >
                <span>Reset export status</span>
              </Confirm>
            </MenuItem>
            <MenuItem>
              <Confirm
                title="Reset table"
                text={resetTableText}
                buttonLabel="Reset"
                buttonType="success"
                onConfirm={this._handleResetTable}
              >
                <span>Reset table</span>
              </Confirm>
            </MenuItem>
            <MenuItem>
              <Confirm
                title="Synchronize dataset"
                text={synchronizeTableText}
                buttonLabel="Synchronize"
                buttonType="success"
                onConfirm={this._handleSynchronizeTable}
              >
                <span>Synchronize dataset</span>
              </Confirm>
            </MenuItem>
          </DropdownButton>
          {this.state.table.get('pendingActions').contains('uploadTable') ? (
            <Button>
              <Loader className="fa-fw" />
              {' Upload table'}
            </Button>
          ) : (
            <Confirm
              text={uploadTableText}
              title="Upload Table"
              buttonLabel="Upload"
              buttonType="success"
              onConfirm={this._handleUpload}
            >
              <Button disabled={this.state.isEditingColumns || this._isAllColumnsIgnored()}>
                <span className="fa fa-upload fa-fw" />
                {' Upload table'}
              </Button>
            </Confirm>
          )}
        </ButtonGroup>
      </div>
    );
  }
});
