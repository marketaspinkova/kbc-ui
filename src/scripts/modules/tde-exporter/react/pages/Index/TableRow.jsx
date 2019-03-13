import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Confirm from '../../../../../react/common/Confirm';
import FileSize from '../../../../../react/common/FileSize';
import date from '../../../../../utils/date';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    configId: PropTypes.string.isRequired,
    tdeFile: PropTypes.object,
    deleteRowFn: PropTypes.func,
    prepareRunDataFn: PropTypes.func,
    configData: PropTypes.object,
    uploadComponentId: PropTypes.string,
    tdeFileName: PropTypes.string,
    uploadComponentIdSetFn: PropTypes.func,
    isDeleted: PropTypes.bool
  },

  render() {
    return (
      <div className="tr">
        <span className="td">
          <SapiTableLinkEx tableId={this.props.table.get('id')} linkLabel={this.props.table.get('name')} />
        </span>
        {this.props.tdeFile ? (
          <span className="td">
            <OverlayTrigger
              overlay={
                <Tooltip id={this.props.tdeFile.get('id')}>
                  <div>{this.props.tdeFile.getIn(['creatorToken', 'description'])}</div>
                  <div>{date.format(this.props.tdeFile.get('created'))}</div>
                  <div><FileSize size={this.props.tdeFile.get('sizeBytes')} /></div>
                </Tooltip>
              }
              placement="top"
            >
              <a href={this.props.tdeFile.get('url')}>{this.props.tdeFile.get('name')}</a>
            </OverlayTrigger>
          </span>
        ) : (
          <span className="td">{this.props.tdeFileName}</span>
        )}
        {
          // ACTION BUTTONS
          <span className="td text-right kbc-no-wrap">
            {!this.props.isDeleted && (
              <OverlayTrigger overlay={<Tooltip id="edit_tooltip">Edit table configuration</Tooltip>} placement="top">
                <Link
                  className="btn btn-link"
                  to="tde-exporter-table"
                  params={{
                    config: this.props.configId,
                    tableId: this.props.table.get('id')
                  }}
                >
                  <i className="fa fa-fw kbc-icon-pencil" />
                </Link>
              </OverlayTrigger>
            )}
            <Confirm
              key={this.props.table.get('id')}
              title={`Remove ${this.props.table.get('id')}`}
              text="You are about to remove the table from the configuration."
              buttonLabel="Remove"
              onConfirm={() => this.props.deleteRowFn()}
            >
              <OverlayTrigger
                overlay={<Tooltip id="delete_tooltip">Delete table from configuration</Tooltip>}
                placement="top"
              >
                <button className="btn btn-link">
                  <i className="kbc-icon-cup" />
                </button>
              </OverlayTrigger>
            </Confirm>
            {!this.props.isDeleted && this._renderRunButton()}
          </span>
        }
      </div>
    );
  },

  _renderRunButton() {
    return (
      <OverlayTrigger overlay={<Tooltip id="export_tooltip">Export to TDE File</Tooltip>} placement="top">
        <RunButtonModal
          title={`Export ${this.props.table.get('id')} to TDE`}
          tooltip={`Export ${this.props.table.get('id')} to TDE`}
          mode="button"
          component="tde-exporter"
          runParams={() => this.props.prepareRunDataFn()}
        >
          {`You are about export ${this.props.table.get('id')} to TDE.`}
        </RunButtonModal>
      </OverlayTrigger>
    );
  }
});
