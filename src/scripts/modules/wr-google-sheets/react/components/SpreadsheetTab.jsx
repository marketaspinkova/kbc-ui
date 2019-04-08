import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Col, ControlLabel, HelpBlock, FormGroup, Radio } from 'react-bootstrap';
import Picker from '../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../google-utils/react/PickerViewTemplates';

export default createReactClass({
  propTypes: {
    onSelectExisting: PropTypes.func.isRequired,
    onSelectFolder: PropTypes.func.isRequired,
    onChangeTitle: PropTypes.func.isRequired,
    onSwitchType: PropTypes.func.isRequired,
    valueTitle: PropTypes.string.isRequired,
    valueFolder: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['new', 'existing'])
  },

  render() {
    const spreadsheet = (this.props.type === 'new') ? this.renderFolderPicker() : this.renderSpreadsheetPicker();
    return (
      <div className="form-horizontal">
        {this.renderTypeRadio()}
        {spreadsheet}
      </div>
    );
  },

  renderTypeRadio() {
    return (
      <FormGroup>
        <Col md={2} componentClass={ControlLabel}>
          Upload data to
        </Col>
        <Col md={10}>
          <FormGroup>
            <Radio
              value="new"
              checked={this.props.type === 'new'}
              onChange={(event) => this.props.onSwitchType(event.target.value)}
            >
              New spreadsheet
            </Radio>
            <HelpBlock>
              Create new Spreadsheet
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <Radio
              value="existing"
              checked={this.props.type === 'existing'}
              onChange={(event) => this.props.onSwitchType(event.target.value)}
            >
              Existing spreadsheet
            </Radio>
            <HelpBlock>
              Use existing Spreadsheet
            </HelpBlock>
          </FormGroup>
        </Col>
      </FormGroup>
    );
  },

  renderSpreadsheetPicker() {
    return (
      <FormGroup>
        <Col md={2} componentClass={ControlLabel}>
          Spreadsheet
        </Col>
        <Col md={10}>
          <Picker
            dialogTitle="Select Spreadsheet"
            buttonLabel={this.props.valueTitle ? this.props.valueTitle : 'Select Spreadsheet'}
            onPickedFn={this.props.onSelectExisting}
            buttonProps={{bsStyle: 'default'}}
            views={[
              ViewTemplates.sheets,
              ViewTemplates.teamDriveSheets,
              ViewTemplates.sharedSheets,
              ViewTemplates.starredSheets,
              ViewTemplates.recentSheets
            ]}
            multiselectEnabled={false}
          />
          <HelpBlock>
            Choose the spreadsheet into which you want to upload the data
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderFolderPicker() {
    return (
      <FormGroup>
        <Col md={2} componentClass={ControlLabel}>
          Spreadsheet
        </Col>
        <Col md={10}>
          <div className="input-group">
            <div className="input-group-btn">
              <Picker
                dialogTitle="Select Folder"
                buttonLabel={this.props.valueFolder}
                onPickedFn={this.props.onSelectFolder}
                buttonProps={{bsStyle: 'default'}}
                views={[
                  ViewTemplates.rootFolder,
                  ViewTemplates.teamDriveFolders,
                  ViewTemplates.sharedFolders,
                  ViewTemplates.starredFolders
                ]}
                multiselectEnabled={false}
              />
            </div>
            <input
              placeholder="New Spreadsheet"
              type="text"
              value={this.props.valueTitle ? this.props.valueTitle : ''}
              onChange={this.props.onChangeTitle}
              className="form-control"
            />
          </div>
          <HelpBlock>
            Select the spreadsheet parent <strong>folder</strong> and enter the spreadsheet <strong>title</strong>.<br/>The spreadsheet will be created upon saving.
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }
});
