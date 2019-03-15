import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';
import { Loader } from '@keboola/indigo-ui';

import Confirm from '../../../../../react/common/Confirm';
import Tooltip from '../../../../../react/common/Tooltip';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

import ActivateTableExportButton from '../../components/ActivateTableExportButton';
import actionCreators from '../../../actionCreators';

export default createReactClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    table: PropTypes.object.isRequired,
    configId: PropTypes.string.isRequired,
    sapiTable: PropTypes.object.isRequired,
    deleteTableFn: PropTypes.func,
    isDeleting: PropTypes.bool,
    isDeleted: PropTypes.bool
  },

  render() {
    let titleClass = 'td';
    if (!this.props.table.getIn(['data', 'export'])) {
      titleClass = 'td text-muted';
    }
    const Elem = this.props.isDeleted ? 'div' : Link;
    return (
      <Elem
        className="tr"
        to="gooddata-writer-table"
        params={{
          config: this.props.configId,
          table: this.props.table.get('id')
        }}
      >
        <span className="td">
          <SapiTableLinkEx
            tableId={this.props.table.get('id')}
            linkLabel={this.props.sapiTable.get('name')}
          />
        </span>
        <span className={titleClass}>{this.props.table.getIn(['data', 'title'])}</span>
        {this.props.isDeleted ? (
          <span className="td text-right">{this._renderDeleteButton()}</span>
        ) : (
          <span className="td text-right">
            <ActivateTableExportButton configId={this.props.configId} table={this.props.table} />
            {this._renderDeleteButton()}
            {this.props.table.get('pendingActions').contains('uploadTable') ? (
              <span className="btn btn-link">
                <Loader className="fa-fw" />
              </span>
            ) : (
              <Confirm
                text={this._uploadText()}
                title="Upload Table"
                buttonLabel="Upload"
                buttonType="success"
                onConfirm={this._handleUpload}
              >
                <Tooltip tooltip="Upload table to GoodData">
                  <button className="btn btn-link">
                    <span className="fa fa-upload fa-fw" />
                  </button>
                </Tooltip>
              </Confirm>
            )}
          </span>
        )}
      </Elem>
    );
  },

  _uploadText() {
    return (
      <span>
        {'Are you sure you want to upload the table '}
        <strong>{this.props.table.getIn(['data', 'title'])}</strong>
        {' to the GoodData project?'}
      </span>
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
  },

  _handleUpload() {
    return actionCreators.uploadToGoodData(this.props.configId, this.props.table.get('id'));
  },

  _handleExportChange(newExportStatus) {
    return actionCreators.saveTableField(
      this.props.configId,
      this.props.table.get('id'),
      'export',
      newExportStatus
    );
  }
});
