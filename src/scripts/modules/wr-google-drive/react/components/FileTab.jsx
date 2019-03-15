import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Checkbox, Col, FormGroup, HelpBlock } from 'react-bootstrap';
import {RadioGroup} from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
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
      <div className="form-group">
        <label className="col-md-2 control-label">
          File exists?
        </label>
        <div className="col-md-10">
          <RadioGroup
            name="type"
            selectedValue={this.props.type}
            onChange={this.props.onSwitchType}
          >
            <RadioGroupInput
              label="No"
              help="Create a new File, that will be updated on each run"
              wrapperClassName="col-sm-8"
              value="new"
            />
            <RadioGroupInput
              label="Yes"
              help="Use existing File"
              wrapperClassName="col-sm-8"
              value="existing"
            />
          </RadioGroup>
        </div>
      </div>
    );
  },

  renderFilePicker() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          File location
        </label>
        <div className="col-md-10">
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
          <span className="help-block">
            Choose File you wish to update
          </span>
        </div>
      </div>
    );
  },

  renderFolderPicker() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          File location
        </label>
        <div className="col-md-10">
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
              placeholder="New File"
              type="text"
              value={this.props.valueTitle ? this.props.valueTitle : ''}
              onChange={this.props.onChangeTitle}
              className="form-control"
            />
          </div>
          <span className="help-block">
            Select Files parent <strong>folder</strong> and enter <strong>title</strong> of the File.<br/>
            {this.props.valueAction === 'create' ? 'The File will be created on next run. Current date and time will be appended to Files name.' : 'The File will be created upon save.'}
          </span>
        </div>
      </div>
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
            After upload, file will be converted so it can be edited directly in Google Drive
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }
});
