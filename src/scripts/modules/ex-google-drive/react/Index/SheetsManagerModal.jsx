import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Map, List, fromJS} from 'immutable';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

import GdrivePicker from '../../../google-utils/react/GooglePicker';
// import ApplicationActionCreators from '../../../../actions/ApplicationActionCreators';
import EmptyState from '../../../components/react/components/ComponentEmptyState';

// import './ProfilesManagerModal.less';
import ViewTemplates from '../../../google-utils/react/PickerViewTemplates';
import {listSheets} from '../../../google-utils/react/SheetsApi';
import SheetsSelector from './SheetsSelector';


export default createReactClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    authorizedEmail: PropTypes.string,
    localState: PropTypes.object.isRequired,
    savedSheets: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveSheets: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Add Sheets
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="table kbc-table-border-vertical kbc-detail-table" style={{borderBottom: 0}}>
              <div className="tr">
                <div className="td" key="1">
                  {this.renderFilesSelector()}
                  {this.renderSheetsSelector()}
                </div>
                <div className="td" key="2">
                  {this.renderSelectedSheets()}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel="Create Sheet"
            isDisabled={!this.hasSheetsToSave()}
          />

        </Modal.Footer>
      </Modal>
    );
  },

  renderFilesSelector() {
    return (
      <div className="text-center">
        <h3>
          1. Select documents from {this.props.authorizedEmail}
        </h3>
        <GdrivePicker
          email={this.props.authorizedEmail}
          dialogTitle="Select a spreadsheet document"
          buttonLabel="Select spreadsheet document from Google Drive..."
          onPickedFn={this.onPickSpreadsheet}
          requireSheetsApi={true}
          views={[
            ViewTemplates.sheets,
            ViewTemplates.teamDriveSheets,
            ViewTemplates.sharedSheets,
            ViewTemplates.starredSheets,
            ViewTemplates.recentSheets
          ]}
        />

      </div>
    );
  },

  renderFilesSelectorEmptyState() {
    return (
      <EmptyState>
        <small>
          <p>Requires temporal authorization of a Google account after which a short-lived access token is obtained to load spreadsheet documents from the selected account. </p>
          <p>Google authorization uses a pop up window, hence disable windows pop up blocking for this site in the browser settings please.</p>
        </small>
      </EmptyState>
    );
  },

  renderSheetsSelector() {
    const files = this.props.localState.get('files');
    if (!files) return this.renderFilesSelectorEmptyState();
    return (
      <div className="text-center">
        <h3>
          2. Select sheets from the selected documents
        </h3>
        <div className="kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table">
          {files.count() > 0 ?
            files.map((file, index) => {
              return (
                <SheetsSelector
                  key={index}
                  file={file}
                  onSelectFile={this.selectFile}
                  selectSheet={this.selectSheet}
                />
              );
            })
            : <EmptyState> No Files Selected </EmptyState>
          }
        </div>
      </div>
    );
  },

  selectFile(fileId) {
    const sheetsApi = this.getFileSheets(fileId);
    if (sheetsApi.get('isLoading')) return null;
    if (sheetsApi.get('sheets')) {
      const file = this.getFile(fileId);
      return this.updateFile(fileId, file.set('isExpanded', !file.get('isExpanded')));
    }
    return this.loadFileSheets(fileId);
  },

  getFileSheets(fileId) {
    return this.getFile(fileId).get('sheetsApi', Map());
  },

  getFile(fileId) {
    const files = this.props.localState.get('files', List());
    return files.find((f) => f.get('id') === fileId);
  },

  updateFile(fileId, newFile) {
    const newFiles = this.props.localState.get('files', List()).map((f) => f.get('id') === fileId ? newFile : f);
    this.props.updateLocalState('files', newFiles);
  },

  loadFileSheets(fileId) {
    const file = this.getFile(fileId);
    this.updateFile(fileId, file.setIn(['sheetsApi', 'isLoading'], true));
    return listSheets(fileId).then((sheets) => {
      return this.updateFile(fileId, file
        .set('sheetsApi', fromJS({
          isLoading: false,
          sheets: this.remapSheets(fileId, sheets.result.sheets)
        }))
        .set('isExpanded', true)
      );
    });
  },

  remapSheets(fileId, sheets) {
    return sheets.map((sheet) => {
      const s = sheet.properties;
      const sid = s.sheetId;
      return {
        sheetId: sid,
        sheetTitle: s.title,
        isSaved: !!this.props.savedSheets.find((ss) => ss.get('sheetId') === sid && ss.get('fileId') === fileId)
      };
    });
  },


  addFiles(filesToAdd) {
    let files = this.props.localState.get('files', List());
    for (let file of filesToAdd) {
      if (!this.getFile(file.id)) files = files.push(fromJS(file));
    }
    this.props.updateLocalState('files', files);
    files.map((f) => this.selectFile(f.get('id')));
  },

  onPickSpreadsheet(data) {
    const docs = data.filter((f) => f.type === 'document');
    this.addFiles(docs);
  },

  renderSelectedSheets() {
    const files = this.props.localState.get('files', List()).map((f) => {
      const sheets =  f.getIn(['sheetsApi', 'sheets'], List());
      return f.setIn(['sheetsApi', 'sheets'], sheets.filter((s) => !!s.get('selected')));
    });
    const hasSelectedSheets = this.hasSheetsToSave();

    return (
      <div>
        <h3>
          Selected sheets to be added to the project
        </h3>
        { !!hasSelectedSheets ?
          <ul>
            {
              files.map((f) =>
                f.getIn(['sheetsApi', 'sheets']).map((s) =>
                  this.renderSelectedItem(f, s))
                  .toArray())
                .toArray()
            }
          </ul>
          :
          <EmptyState>
            No sheets selected.
          </EmptyState>
        }
      </div>
    );
  },

  selectSheet(file, sheet) {
    const isSelected = !!sheet.get('selected');
    const sheetId = sheet.get('sheetId');
    const sheetToUpdate = sheet.set('selected', !isSelected);
    const newSheets = this.getFileSheets(file.get('id')).get('sheets')
      .map((s) => s.get('sheetId') === sheetId ? sheetToUpdate : s);
    this.updateFile(file.get('id'), file.setIn(['sheetsApi', 'sheets'], newSheets));
  },

  hasSheetsToSave() {
    const files = this.props.localState.get('files', List());
    return files.find((f) => f.getIn(['sheetsApi', 'sheets'], List()).find((s) => s.get('selected')));
  },

  renderSelectedItem(file, sheet) {
    return (
      <li>
        {file.get('name')} / {sheet.get('sheetTitle')}
        <span
          onClick={() => this.selectSheet(file, sheet)}
          className="kbc-icon-cup kbc-cursor-pointer"/>
      </li>
    );
  },

  handleSave() {
    const files = this.props.localState.get('files', List());
    const itemsToSave = files.map((f) =>
      f.getIn(['sheetsApi', 'sheets'])
        .filter((s) => !!s.get('selected'))
        .map((s) => {
          return fromJS({
            fileId: f.get('id'),
            fileTitle: f.get('name'),
            sheetId: s.get('sheetId'),
            sheetTitle: s.get('sheetTitle')
          });
        })).flatten(true);
    this.props.onSaveSheets(itemsToSave).then(() => {
      const newFiles = files.map((f) => {
        const newSheets = f.getIn(['sheetsApi', 'sheets'], List())
          .map((s) => s.set('isSaved', s.get('isSaved') || !!s.get('selected'))
            .set('selected', false));
        return f.setIn(['sheetsApi', 'sheets'], newSheets);
      }
      );

      this.props.updateLocalState('files', newFiles);
      this.props.onHideFn();
    });
  }

});
