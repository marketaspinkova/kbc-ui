import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Checkbox, Col, FormGroup, FormControl, HelpBlock, Radio, ControlLabel } from 'react-bootstrap';
import Picker from '../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../google-utils/react/PickerViewTemplates';

export default createReactClass({
  propTypes: {
    onSelectExisting: PropTypes.func.isRequired,
    onSelectFolder: PropTypes.func.isRequired,
    onChangeTitle: PropTypes.func.isRequired,
    onToggleConvert: PropTypes.func.isRequired,
    onSwitchType: PropTypes.func.isRequired,
    valueTitle: PropTypes.string.isRequired,
    valueFolder: PropTypes.string.isRequired,
    valueAction: PropTypes.oneOf(['create', 'update']),
    valueConvert: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['new', 'existing'])
  },

  render() {
    const radio = (this.props.valueAction === 'create') ? null : this.renderTypeRadio();
    const picker = (this.props.type === 'new') ? this.renderFolderPicker() : this.renderFilePicker();
    const convertCheckbox = (this.props.type === 'new') ? this.renderConvertCheckbox() : null;
    return (
      <div className="form-horizontal">
        {radio}
        {picker}
        {convertCheckbox}
      </div>
    );
  },

  renderTypeRadio() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          File exists?
        </Col>
        <Col md={10}>
          <FormGroup>
            <Radio
              value="new"
              checked={this.props.type === 'new'}
              onChange={(event) => this.props.onSwitchType(event.target.value)}
            >
              No
            </Radio>
            <HelpBlock>
              Create a new file that will be updated on each run
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <Radio
              value="existing"
              checked={this.props.type === 'existing'}
              onChange={(event) => this.props.onSwitchType(event.target.value)}
            >
              Yes
            </Radio>
            <HelpBlock>
              Use an existing file
            </HelpBlock>
          </FormGroup>
        </Col>
      </FormGroup>
    );
  },

  renderFilePicker() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          File location
        </Col>
        <Col md={10}>
          <Picker
            dialogTitle="Select File"
            buttonLabel={this.props.valueTitle ? this.props.valueTitle : 'Select File'}
            onPickedFn={this.props.onSelectExisting}
            buttonProps={{bsStyle: 'default'}}
            views={[
              ViewTemplates.files,
              ViewTemplates.teamDriveFiles,
              ViewTemplates.sharedFiles,
              ViewTemplates.starredFiles,
              ViewTemplates.recentFiles
            ]}
            multiselectEnabled={false}
          />
          <HelpBlock>
            Choose a file you wish to update
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderFolderPicker() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          File location
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
            <FormControl
              placeholder="New file"
              type="text"
              value={this.props.valueTitle ? this.props.valueTitle : ''}
              onChange={this.props.onChangeTitle}
            />
          </div>
          <HelpBlock>
            Select the file parent <strong>folder</strong> and enter the <strong>title</strong> of the file.<br/>
            {this.props.valueAction === 'create' ? 'The file will be created on the next run. The current date and time will be appended to the file name.' : 'The file will be created upon saving.'}
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderConvertCheckbox() {
    return (
      <FormGroup>
        <Col md={10} mdOffset={2}>
          <Checkbox
            checked={this.props.valueConvert}
            onChange={this.props.onToggleConvert}
          >
            Convert to Google Docs format
          </Checkbox>
          <HelpBlock>
            After the upload, the file will be converted so it can be edited directly in Google Drive
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }
});
