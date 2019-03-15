import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {RadioGroup} from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
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
      <div className="form-group">
        <label className="col-md-2 control-label">
          Upload data to
        </label>
        <div className="col-md-10">
          <RadioGroup
            name="type"
            selectedValue={this.props.type}
            onChange={this.props.onSwitchType}
          >
            <RadioGroupInput
              label="New spreadsheet"
              help="Create new Spreadsheet"
              wrapperClassName="col-sm-8"
              value="new"
            />
            <RadioGroupInput
              label="Existing spreadsheet"
              help="Use existing Spreadsheet"
              wrapperClassName="col-sm-8"
              value="existing"
            />
          </RadioGroup>
        </div>
      </div>
    );
  },

  renderSpreadsheetPicker() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          Spreadsheet
        </label>
        <div className="col-md-10">
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
          <span className="help-block">
            Choose Spreadsheet, in which you want to upload the data
          </span>
        </div>
      </div>
    );
  },

  renderFolderPicker() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          Spreadsheet
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
              placeholder="New Spreadsheet"
              type="text"
              value={this.props.valueTitle ? this.props.valueTitle : ''}
              onChange={this.props.onChangeTitle}
              className="form-control"
            />
          </div>
          <span className="help-block">
            Select Spreadsheets parent <strong>folder</strong> and enter Spreadsheets <strong>title</strong>.<br/>The Spreadsheet will be created upon save.
          </span>
        </div>
      </div>
    );
  }
});
