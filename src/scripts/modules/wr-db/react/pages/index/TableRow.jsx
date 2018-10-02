import React from 'react';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import Confirm from '../../../../../react/common/Confirm';
import Tooltip from '../../../../../react/common/Tooltip';
import { Check, Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import dockerProxyApi from '../../../templates/dockerProxyApi';

import ImmutableRenderMixin from 'react-immutable-render-mixin';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    tableExists: React.PropTypes.bool.isRequired,
    isTableExported: React.PropTypes.bool.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    isV2: React.PropTypes.bool.isRequired,
    onExportChangeFn: React.PropTypes.func.isRequired,
    table: React.PropTypes.object.isRequired,
    v2ConfigTable: React.PropTypes.object.isRequired,
    tableDbName: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    deleteTableFn: React.PropTypes.func.isRequired,
    isDeleting: React.PropTypes.bool.isRequired
  },

  render() {
    const Wrapper = this.props.tableExists ? Link : 'div';

    return (
      <Wrapper
        className={this.props.tableExists ? 'tr' : 'tr text-muted'}
        to={`${this.props.componentId}-table`}
        params={{
          config: this.props.configId,
          tableId: this.props.table.get('id')
        }}
      >
        <span className="td">
          <SapiTableLinkEx tableId={this.props.table.get('id')}>{this.props.table.get('name')}</SapiTableLinkEx>
        </span>
        <span className="td">{this.props.tableDbName}</span>
        {this.props.isV2 && (
          <span className="td">
            <Check isChecked={this.props.v2ConfigTable && this.props.v2ConfigTable.get('incremental')} />
          </span>
        )}
        <span className="td text-right">
          {this._renderDeleteButton()}
          <ActivateDeactivateButton
            activateTooltip="Select table to upload"
            deactivateTooltip="Deselect table from upload"
            isActive={this.props.isTableExported}
            isPending={this.props.isPending}
            onChange={this.props.onExportChangeFn}
          />
          {this.props.tableExists && (
            <Tooltip tooltip="Upload table to Dropbox">
              <RunButtonModal
                title="Run"
                tooltip={`Upload ${this.props.table.get('id')}`}
                mode="button"
                icon="fa fa-play fa-fw"
                component={this.props.componentId}
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
                {`You are about to run the upload of ${this.props.table.get('id')} to the database.`}
              </RunButtonModal>
            </Tooltip>
          )}
        </span>
      </Wrapper>
    );
  },

  _renderDeleteButton() {
    if (this.props.isDeleting) {
      return (
        <span className="btn btn-link">
          <Loader />
        </span>
      );
    } else {
      return (
        <Confirm
          key={this.props.table.get('id')}
          title={`Remove ${this.props.table.get('id')}`}
          text="You are about to remove the table from the configuration."
          buttonLabel="Remove"
          onConfirm={() => {
            return this.props.deleteTableFn(this.props.table.get('id'));
          }}
        >
          <Tooltip tooltip="Remove table from configuration" placement="top">
            <button className="btn btn-link">
              <i className="kbc-icon-cup" />
            </button>
          </Tooltip>
        </Confirm>
      );
    }
  }
});
