import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';

import goodDataWriterStore from '../../../store';
import actionCreators from '../../../actionCreators';
import storageApi from '../../../../components/StorageApi';

import ColumnsEditor from './DatasetColumnsEditor';
import EditButtons from '../../../../../react/common/EditButtons';
import TableGdName from './TableGdNameEdit';
import ActivateTableExportButton from '../../components/ActivateTableExportButton';

export default createReactClass({
  mixins: [createStoreMixin(goodDataWriterStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const tableId = RoutesStore.getCurrentRouteParam('table');
    const isEditingColumns = goodDataWriterStore.isEditingTableColumns(configurationId, tableId);

    return {
      configurationId,
      table: goodDataWriterStore.getTable(configurationId, tableId),
      isEditingColumns,
      isSavingColumns: goodDataWriterStore.isSavingTableColumns(configurationId, tableId),
      referenceableTables: goodDataWriterStore.getReferenceableTablesForTable(
        configurationId,
        tableId
      ),
      invalidColumns: goodDataWriterStore.getTableColumnsValidation(configurationId, tableId),
      showIdentifier: true, // isNewWriter bc migration
      columnsReferences: goodDataWriterStore.getTableColumnsReferences(configurationId, tableId),
      columns: goodDataWriterStore.getTableColumns(
        configurationId,
        tableId,
        isEditingColumns ? 'editing' : 'current'
      )
    };
  },

  getInitialState() {
    return { dataPreview: null };
  },

  componentDidMount() {
    if (!this.state.isEditingColumns && this._isAllColumnsIgnored()) {
      this._handleEditStart();
    }
    const component = this;
    return storageApi.tableDataJsonPreview(this.state.table.get('id'), { limit: 10 }).then((json) =>
      component.setState({
        dataPreview: json
      })
    );
  },

  _isAllColumnsIgnored() {
    return this.state.columns.reduce((memo, c) => memo && c.get('type') === 'IGNORE', true);
  },

  _handleEditStart() {
    return actionCreators.startTableColumnsEdit(
      this.state.configurationId,
      this.state.table.get('id')
    );
  },

  _handleEditSave() {
    return actionCreators.saveTableColumnsEdit(
      this.state.configurationId,
      this.state.table.get('id')
    );
  },

  _handleEditCancel() {
    return actionCreators.cancelTableColumnsEdit(
      this.state.configurationId,
      this.state.table.get('id')
    );
  },

  _handleEditUpdate(column) {
    return actionCreators.updateTableColumnsEdit(
      this.state.configurationId,
      this.state.table.get('id'),
      column
    );
  },

  render() {
    const canEditTitle =
      this.state.showIdentifier || !this.state.table.getIn(['data', 'isExported'], true);
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="row kbc-header">
            {this.state.showIdentifier && (
              <div>
                <strong className="col-xs-2">Identifier</strong>
                <TableGdName
                  table={this.state.table}
                  configurationId={this.state.configurationId}
                  fieldName="identifier"
                  canEdit={!this.state.table.getIn(['data', 'isExported'], true)}
                  editTooltip={
                    this.state.table.getIn(['data', 'isExported'])
                      ? 'Identifier cannot be changed. It is already exported to GoodData'
                      : 'Edit GoodData identifier'
                  }
                />
              </div>
            )}
            <div style={{ 'paddingTop': '6px' }}>
              <strong className="col-xs-2">Title</strong>
              <TableGdName
                table={this.state.table}
                configurationId={this.state.configurationId}
                fieldName="title"
                placeholder="Table Name"
                canEdit={canEditTitle}
                editTooltip={
                  !canEditTitle
                    ? 'Title cannot be changed. It is already exported to GoodData'
                    : 'Edit title in GoodData'
                }
              />
            </div>
            <div style={{ 'paddingTop': '6px' }}>
              <strong className="col-xs-2">
                Project Upload
              </strong>
              <ActivateTableExportButton
                configId={this.state.configurationId}
                table={this.state.table}
              />
            </div>
            <div className="kbc-buttons">
              <EditButtons
                isEditing={this.state.isEditingColumns}
                isSaving={this.state.isSavingColumns}
                isDisabled={this.state.invalidColumns.count() > 0 || this._isAllColumnsIgnored()}
                onCancel={this._handleEditCancel}
                onSave={this._handleEditSave}
                onEditStart={this._handleEditStart}
                editLabel="Edit Columns"
              />
            </div>
          </div>
          <ColumnsEditor
            columns={this.state.columns}
            invalidColumns={this.state.invalidColumns}
            columnsReferences={this.state.columnsReferences}
            referenceableTables={this.state.referenceableTables}
            showIdentifier={this.state.showIdentifier}
            isEditing={this.state.isEditingColumns}
            isSaving={this.state.isSavingColumns}
            onColumnChange={this._handleEditUpdate}
            configurationId={this.state.configurationId}
            dataPreview={this.state.dataPreview}
            isExported={this.state.table.getIn(['data', 'isExported'], false)}
          />
        </div>
      </div>
    );
  }
});
