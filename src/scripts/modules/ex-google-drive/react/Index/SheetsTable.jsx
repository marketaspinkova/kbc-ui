import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import * as common from '../../common';
// import {List} from 'immutable';
import StorageTableLink from '../../../components/react/components/StorageApiTableLinkEx';

import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';

import Tooltip from '../../../../react/common/Tooltip';
import {Loader, ExternalLink} from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';

// import {Link} from 'react-router';

const COMPONENT_ID = 'keboola.ex-google-drive';

function getDocumentTitle(sheet) {
  return common.sheetFullName(sheet, ' / ');
}


export default createReactClass({
  propTypes: {
    sheets: PropTypes.object.isRequired,
    configId: PropTypes.string.isRequired,
    outputBucket: PropTypes.string.isRequired,
    deleteSheetFn: PropTypes.func.isRequired,
    onStartEdit: PropTypes.func.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    toggleSheetEnabledFn: PropTypes.func.isRequired,
    getRunSingleSheetDataFn: PropTypes.func.isRequired

  },

  render() {
    return (
      <div className="table table-striped table-hover">
        <div className="thead">
          <div className="tr">
            <div className="th">
              <strong>Document / Sheet </strong>
            </div>
            <div className="th">
              {/* right arrow */}
            </div>
            <div className="th">
              <strong> Output Table </strong>
            </div>
            <div className="th">
              {/* action buttons */}
            </div>
          </div>
        </div>
        <div className="tbody kbc-break-all kbc-break-word">
          {this.props.sheets.map((q) => this.renderSheetRow(q))}
        </div>
      </div>
    );
  },

  renderGoogleLink(sheet) {
    const url = `https://docs.google.com/spreadsheets/d/${sheet.get('fileId')}/edit#gid=${sheet.get('sheetId')}`;
    const documentTitle = getDocumentTitle(sheet);
    return (
      <ExternalLink href={url}>
        {documentTitle}
      </ExternalLink>
    );
  },

  renderSheetRow(sheet) {
    const propValue = (propName) => sheet.getIn([].concat(propName));
    const outTableId = this.props.outputBucket + '.' + propValue('outputTable');
    const documentTitle = getDocumentTitle(sheet);

    return (
      <div
        to={COMPONENT_ID + '-sheet-detail'}
        params={{
          config: this.props.configId,
          sheetId: sheet.get('id')
        }}
        className="tr">
        <div className="td">
          {this.renderGoogleLink(sheet)}
        </div>
        <div className="td">
          <i className="kbc-icon-arrow-right" />
        </div>
        <div className="td">
          <StorageTableLink tableId={outTableId} />
        </div>
        <div className="td text-right kbc-no-wrap">
          {this.renderEditButton(sheet)}
          {this.renderDeleteButton(sheet)}
          <ActivateDeactivateButton
            activateTooltip="Enable Sheet"
            deactivateTooltip="Disable Sheet"
            isActive={sheet.get('enabled')}
            isPending={this.props.isPendingFn(['toggle', sheet.get('id')])}
            onChange={() => this.props.toggleSheetEnabledFn(sheet.get('id'))}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={COMPONENT_ID}
            runParams={ () => {
              return {
                config: this.props.configId,
                configData: this.props.getRunSingleSheetDataFn(sheet.get('id'))
              };
            }}
          >
            You are about to run an extraction of {documentTitle}.
          </RunExtractionButton>
        </div>
      </div>
    );
  },

  renderEditButton(sheet) {
    return (
      <button className="btn btn-link"
        onClick={() => this.props.onStartEdit(sheet)}>
        <Tooltip tooltip="Edit sheet extraction" placement="top">
          <i className="kbc-icon-pencil" />
        </Tooltip>
      </button>
    );
  },

  renderDeleteButton(sheet) {
    const isPending = this.props.isPendingFn(['delete', sheet.get('id')]);
    if (isPending) {
      return <span className="btn btn-link"><Loader/></span>;
    }
    return (
      <Confirm
        title="Delete sheet"
        text={`Do you really want to delete the extraction of the sheet ${getDocumentTitle(sheet)}?`}
        buttonLabel="Delete"
        onConfirm={() => this.props.deleteSheetFn(sheet.get('id'))}
      >
        <Tooltip placement="top" tooltip="Delete sheet">
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  }

});
