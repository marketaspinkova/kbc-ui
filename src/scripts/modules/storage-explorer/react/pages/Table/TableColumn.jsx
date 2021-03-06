import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Promise from 'bluebird';
import { Map } from 'immutable';
import classnames from 'classnames';
import { Button, Row, Label, PanelGroup, Panel, Col } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import Tooltip from '../../../../../react/common/Tooltip';
import CreateColumnModal from '../../modals/CreateColumnModal';
import DeleteColumnModal from '../../modals/DeleteColumnModal';
import { DataTypeKeys } from '../../../../components/MetadataConstants';
import { getDataType } from "../../../../components/utils/datatypeHelpers";
import { deleteTableColumn, addTableColumn, setOpenedColumns, deleteColumnMetadata, saveColumnMetadata } from '../../../Actions';
import ColumnDetails from './ColumnDetails';

export default createReactClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    creatingPrimaryKey: PropTypes.bool.isRequired,
    deletingPrimaryKey: PropTypes.bool.isRequired,
    addingColumn: PropTypes.object.isRequired,
    deletingColumn: PropTypes.object.isRequired,
    canWriteTable: PropTypes.bool.isRequired,
    machineColumnMetadata: PropTypes.object.isRequired,
    userColumnMetadata: PropTypes.object.isRequired,
    openColumns: PropTypes.object.isRequired,
    activeColumnId: PropTypes.string,
  },

  getInitialState() {
    return {
      deleteColumnName: '',
      deleteColumnModal: false,
      createColumnModal: false
    };
  },

  getColumnId(columnName) {
    return this.props.table.get('id') + '.' + columnName;
  },

  saveUserType(columnName, userDataType) {
    const promises = [];
    if (this.props.userColumnMetadata.has(columnName) && !userDataType.has(DataTypeKeys.LENGTH)) {
      this.props.userColumnMetadata.get(columnName).forEach((metadata) => {
        if (metadata.get('key') === DataTypeKeys.LENGTH) {
          promises.push(deleteColumnMetadata(this.getColumnId(columnName), metadata.get('id')));
        }
      });
    }
    promises.push(saveColumnMetadata(this.getColumnId(columnName), userDataType));
    return Promise.all(promises);
  },

  deleteUserType(columnName) {
    const promises = [];
    this.props.userColumnMetadata.get(columnName).forEach((metadata) => {
      if ([DataTypeKeys.BASE_TYPE, DataTypeKeys.LENGTH, DataTypeKeys.NULLABLE].includes(metadata.get('key'))) {
        promises.push(deleteColumnMetadata(this.getColumnId(columnName), metadata.get('id')));
      }
    });
    return Promise.all(promises);
  },

  getUserDefinedType(column) {
    return getDataType(this.props.userColumnMetadata.get(column, Map())).filter(
      (value, key) => [DataTypeKeys.BASE_TYPE, DataTypeKeys.LENGTH, DataTypeKeys.NULLABLE].includes(key)
    );
  },

  render() {
    const canEdit = this.canEditColumns();
    const addingColumn = this.props.addingColumn.get(this.props.table.get('id'), false);

    return (
      <div>
        <h2 className="clearfix">
          {canEdit && (
            <div className="kbc-buttons pull-right">
              <Button bsStyle="success" onClick={this.openCreateColumnModal} disabled={addingColumn}>
                {addingColumn ? (
                  <span>
                    <Loader /> Creating column...
                  </span>
                ) : (
                  <span>Create column</span>
                )}
              </Button>
            </div>
          )}
          Columns
        </h2>
        <PanelGroup className="kbc-accordion">
          {this.props.table
            .get('columns')
            .map((column) => this.renderColumnPanel(column, canEdit))
            .toArray()}
        </PanelGroup>
        {this.renderCreateColumnModal()}
        {this.renderDeleteColumnModal()}
      </div>
    );
  },

  renderColumnPanel(column, canEdit) {
    return (
      <Panel
        collapsible
        expanded={this.isPanelExpanded(column)}
        className={classnames('storage-panel', {
          'is-active': this.props.activeColumnId === this.getColumnId(column)
        })}
        header={this.renderColumnHeader(column)}
        key={this.getColumnId(column)}
        onSelect={() => this.onSelectColumn(this.getColumnId(column))}
      >
        <ColumnDetails
          table={this.props.table}
          columnId={this.getColumnId(column)}
          columnName={column}
          machineDataType={getDataType(this.props.machineColumnMetadata.get(column, Map()))}
          userDataType={this.getUserDefinedType(column)}
          deleteUserType={this.deleteUserType}
          saveUserType={this.saveUserType}
          canEdit={canEdit}
        />
      </Panel>
    );
  },

  renderColumnHeader(column) {
    return (
      <div>
        <Row>
          <Col sm={3}>{column}</Col>
          <Col sm={7}>{this.renderDatatypes(column)}</Col>
          <Col sm={1}>{this.renderPrimaryKeyLabel(column)}</Col>
          <Col sm={1}>{this.renderActions(column)}</Col>
        </Row>
      </div>
    );
  },

  renderDatatypes(column) {
    const userDataType = this.getUserDefinedType(column);
    const systemDataType = getDataType(this.props.machineColumnMetadata.get(column, Map()));
    const columnDataType = userDataType.has(DataTypeKeys.BASE_TYPE)
      ? userDataType.set('provider', 'user')
      : systemDataType;

    if (!columnDataType.has('provider')) {
      return null;
    }

    return (
      <div>
        {columnDataType.get('KBC.datatype.basetype') && columnDataType.get('KBC.datatype.basetype')}
        {columnDataType.get('KBC.datatype.length') && `(${columnDataType.get('KBC.datatype.length')})`}
        {columnDataType.get('KBC.datatype.nullable') && `, Nullable`}
      </div>
    );
  },

  renderPrimaryKeyLabel(column) {
    if (!this.isColumnInPrimaryKey(column)) {
      return null;
    }

    return <Label bsStyle="info">PK</Label>;
  },

  renderActions(column) {
    if (!this.canDeleteColumn(column)) {
      return null;
    }

    if (this.isColumnForceDeletable(column)) {
      const deleting = !!this.props.deletingColumn.getIn([this.props.table.get('id'), column]);

      return (
        <Tooltip tooltip="Delete column" placement="top">
          <Button
            bsStyle="link"
            onClick={(event) => {
              event.stopPropagation();
              this.openDeleteColumnModal(column);
            }}
            disabled={deleting}
          >
            {deleting ? <Loader /> : <i className="fa fa-trash-o" />}
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip tooltip="Column is used in an alias filter or in alias without synchronized columns" placement="top">
        <Button bsStyle="link" disabled={false}>
          <i className="fa fa-ban" />
        </Button>
      </Tooltip>
    );
  },

  renderCreateColumnModal() {
    return (
      <CreateColumnModal
        show={this.state.createColumnModal}
        table={this.props.table}
        tables={this.props.tables}
        onSubmit={this.handleCreateColumn}
        onHide={this.closeCreateColumnModal}
      />
    );
  },

  renderDeleteColumnModal() {
    return (
      <DeleteColumnModal
        show={this.state.deleteColumnModal}
        column={this.state.deleteColumnName}
        tableAliases={this.props.tableAliases}
        tableLinks={this.props.tableLinks}
        onConfirm={this.handleDeleteColumn}
        onHide={this.closeDeleteColumnModal}
        sapiToken={this.props.sapiToken}
        urlTemplates={this.props.urlTemplates}
      />
    );
  },

  handleCreateColumn(columnName) {
    const tableId = this.props.table.get('id');
    const params = { name: columnName };
    return addTableColumn(tableId, params);
  },

  handleDeleteColumn(columnName, forceDelete) {
    const tableId = this.props.table.get('id');
    const params = { force: forceDelete };
    return deleteTableColumn(tableId, columnName, params);
  },

  isColumnInPrimaryKey(column) {
    return this.props.table.get('primaryKey').find(item => item === column);
  },

  canEditColumns() {
    const { table } = this.props;

    if (!this.props.canWriteTable || table.getIn(['bucket', 'backend']) === 'redshift') {
      return false;
    }

    return !table.get('isAlias') || !table.get('aliasColumnsAutoSync');
  },

  canDeleteColumn() {
    const { table } = this.props;

    if (!this.props.canWriteTable) {
      return false;
    }

    if (table.get('columns').count() < 2) {
      return false;
    }

    if (
      table.get('isAlias') &&
      (table.getIn(['bucket', 'backend']) === 'redshift' || table.get('aliasColumnsAutoSync'))
    ) {
      return false;
    }

    return true;
  },

  isColumnForceDeletable(column) {
    return !this.isColumnUsedInAliasFilter(column) && !this.isColumnUsedInAliasColumns(column);
  },

  isColumnUsedInAliasFilter(column) {
    const foundAliases = [];

    this.props.tables.forEach(table => {
      if (table.get('isAlias') && table.getIn(['sourceTable', 'id']) === this.props.table.get('id')) {
        if (this.props.sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])) {
          if (table.getIn(['aliasFilter', 'column']) === column) {
            foundAliases.push(table);
          }
        }
      }
    });

    return foundAliases.length > 0;
  },

  isColumnUsedInAliasColumns(column) {
    const foundAliases = [];

    this.props.tables.forEach(table => {
      if (table.get('isAlias') && table.getIn(['sourceTable', 'id']) === this.props.table.get('id')) {
        if (this.props.sapiToken.getIn(['owner', 'id']) === table.getIn(['sourceTable', 'project', 'id'])) {
          if (!table.get('aliasColumnsAutoSync') && table.get('columns').find(item => item === column)) {
            foundAliases.push(table);
          }
        }
      }
    });

    return foundAliases.length > 0;
  },

  openCreateColumnModal() {
    this.setState({
      createColumnModal: true
    });
  },

  closeCreateColumnModal() {
    this.setState({
      createColumnModal: false
    });
  },

  openDeleteColumnModal(column) {
    this.setState({
      deleteColumnName: column,
      deleteColumnModal: true
    });
  },

  closeDeleteColumnModal() {
    this.setState({
      deleteColumnName: '',
      deleteColumnModal: false
    });
  },

  onSelectColumn(columnId) {
    const opened = this.props.openColumns;
    setOpenedColumns(opened.has(columnId) ? opened.delete(columnId) : opened.add(columnId));
  },

  isPanelExpanded(column) {
    if (this.props.activeColumnId === this.getColumnId(column)) {
      return true;
    }

    if (this.props.openColumns.has(this.getColumnId(column))) {
      return true;
    }

    return false;
  }
});
