import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import ActivateDeactivateSwitch from '../../../../../react/common/ActivateDeactivateSwitch';
import Tooltip from '../../../../../react/common/Tooltip';
import { Check, Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import { Alert } from 'react-bootstrap';

import dockerProxyApi from '../../../templates/dockerProxyApi';

import ImmutableRenderMixin from 'react-immutable-render-mixin';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    tableExists: PropTypes.bool.isRequired,
    isTableExported: PropTypes.bool.isRequired,
    isPending: PropTypes.bool.isRequired,
    isUpdating: PropTypes.bool.isRequired,
    isV2: PropTypes.bool.isRequired,
    onExportChangeFn: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired,
    tableDbName: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    deleteTableFn: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    isAdaptive: PropTypes.bool.isRequired,
    v2ConfigTable: PropTypes.object
  },

  render() {
    if (!this.props.tableExists) {
      return (
        <div className={classnames('tr', {
          'text-muted': !this.props.tableExists,
          'row-disabled': !this.props.isTableExported
        })}>
          {this._renderBody()}
        </div>
      );
    }

    return (
      <Link
        className={classnames('tr', {
          'text-muted': !this.props.tableExists,
          'row-disabled': !this.props.isTableExported
        })}
        to={`${this.props.componentId}-table`}
        params={{
          config: this.props.configId,
          tableId: this.props.table.get('id')
        }}
      >
        {this._renderBody()}
      </Link>
    );
  },

  _renderBody() {
    return [
      <span className="td" key="link">
        <SapiTableLinkEx tableId={this.props.table.get('id')}>{this.props.table.get('name')}</SapiTableLinkEx>
      </span>,
      <span className="td" key="name">{this.props.tableDbName}</span>,
      this.props.isV2 && (
        <span className="td" key="incremental">
          <Check isChecked={!!(this.props.v2ConfigTable && this.props.v2ConfigTable.get('incremental'))} />
        </span>
      ),
      <span className="td text-right" key="action">
        {this._renderDeleteButton()}
        {this.props.tableExists && (
          <Tooltip tooltip="Upload table to Dropbox">
            <RunButtonModal
              title="Run"
              tooltip={`Upload ${this.props.table.get('id')}`}
              mode="button"
              icon="fa fa-play fa-fw"
              component={this.props.componentId}
              disabled={this.props.isUpdating}
              runParams={() => {
                const tableId = this.props.table.get('id');
                const { configId } = this.props;
                const params = {
                  table: tableId,
                  writer: configId
                };
                const api = dockerProxyApi(this.props.componentId);
                return (api ? api.getTableRunParams(configId, tableId) : null) || params;
              }}
            >
              {this.props.isAdaptive && (<Alert bsStyle="danger">
                <p>Your data filter is set to <code>Since last successful run</code>.</p>
                <p>Adaptive incremental processing is only available when running the whole configuration. Running the writer on a single table will perform a full load.</p>
              </Alert>)}
              <p>You are about to run an upload of {this.props.table.get('id')} to the database.</p>
            </RunButtonModal>
          </Tooltip>
        )}
        <ActivateDeactivateSwitch
          activateTooltip="Select table to upload"
          deactivateTooltip="Deselect table from upload"
          isActive={this.props.isTableExported}
          isPending={this.props.isPending}
          onChange={this.props.onExportChangeFn}
          buttonDisabled={this.props.isUpdating}
        />
      </span>
    ];
  },

  _renderDeleteButton() {
    if (this.props.isDeleting) {
      return (
        <span className="btn btn-link">
          <Loader />
        </span>
      );
    }

    return (
      <Tooltip tooltip="Remove table from configuration" placement="top">
        <button className="btn btn-link" disabled={this.props.isUpdating} onClick={this.handleDeleteTable}>
          <i className="kbc-icon-cup" />
        </button>
      </Tooltip>
    );
  },

  handleDeleteTable(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.props.deleteTableFn(this.props.table.get('id'));
  }
});
