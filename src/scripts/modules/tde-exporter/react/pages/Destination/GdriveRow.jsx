import React from 'react';
import _ from 'underscore';
import { Map } from 'immutable';
import GdriveModal from './AuthorizeGdriveModal';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Picker from '../../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../../google-utils/react/PickerViewTemplates';
import Confirm from '../../../../../react/common/Confirm';

export default React.createClass({
  propTypes: {
    renderComponent: React.PropTypes.func,
    renderEnableUpload: React.PropTypes.func,
    resetUploadTask: React.PropTypes.func,
    updateLocalStateFn: React.PropTypes.func,
    saveTargetFolderFn: React.PropTypes.func,
    localState: React.PropTypes.object,
    configId: React.PropTypes.string,
    account: React.PropTypes.object
  },

  render() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <Form horizontal>
          <FormGroup>
            <ControlLabel className="col-sm-2">Destination</ControlLabel>
            <FormControl.Static className="col-sm-10" componentClass="div">
              {this.props.renderComponent()}
            </FormControl.Static>
          </FormGroup>
          <FormGroup>
            <ControlLabel className="col-sm-2">Authorization status</ControlLabel>
            <FormControl.Static className="col-sm-10" componentClass="div">
              {this._renderAuthorization()}
              {this._renderAuthorizedInfo()}
            </FormControl.Static>
          </FormGroup>
          {this._isAuthorized() && (
            <FormGroup>
              <ControlLabel className="col-sm-2">Instant upload</ControlLabel>
              <FormControl.Static className="col-sm-10" componentClass="div">
                {this.props.renderEnableUpload(this._accountName())}
              </FormControl.Static>
            </FormGroup>
          )}
        </Form>
      </div>
    );
  },

  _renderAuthorizedInfo() {
    return (
      <div>
        {!this._isAuthorized() && <div>{this._renderAuthorizeButton()}</div>}
        {this._isAuthorized() && <div>{this._renderPicker()}</div>}
        {this._isAuthorized() && (
          <div>
            <Confirm
              title="Reset Authorization"
              text={`Do you really want to reset the authorization for ${this.props.account.get('email')}`}
              buttonLabel="Reset"
              onConfirm={() => this.props.resetUploadTask()}
            >
              <Button bsStyle="link">
                <span className="fa fa-trash" />
                {' Reset Authorization'}
              </Button>
            </Confirm>
          </div>
        )}
      </div>
    );
  },

  _accountName() {
    return this.props.account && this.props.account.get('email', '');
  },

  _renderAuthorization() {
    if (!this._isAuthorized()) {
      return <p>Not Authorized.</p>;
    }

    return (
      <div>
        <p>
          {'Authorized for '}
          <strong>{this._accountName()}</strong>
        </p>
        <p>
          {'Folder: '}
          <strong>{this.props.account.get('targetFolderName') || '/'}</strong>
        </p>
      </div>
    );
  },

  _renderAuthorizeButton() {
    return (
      <div>
        <Button bsStyle="success" onClick={() => this.props.updateLocalStateFn(['gdrivemodal', 'show'], true)}>
          <i className="fa fa-google" />
          {' Authorize'}
        </Button>
        <GdriveModal
          configId={this.props.configId}
          localState={this.props.localState.get('gdrivemodal', Map())}
          updateLocalState={data => this.props.updateLocalStateFn(['gdrivemodal'], data)}
        />
      </div>
    );
  },

  _renderPicker() {
    let folderId = this.props.account.get('targetFolder');
    let folderName = this.props.account.get('targetFolderName');

    return (
      <Picker
        email={this.props.account.get('email')}
        dialogTitle="Select a folder"
        buttonLabel={(
          <span>
            <span className="fa fa-fw fa-folder-o" /> Select a folder
          </span>
        )}
        onPickedFn={data => {
          let folders = _.filter(data, file => file.type === 'folder');
          folderId = folders[0].id;
          folderName = folders[0].name;
          folders[0].title = folderName;
          this.props.saveTargetFolderFn(folderId, folderName);
        }}
        buttonProps={{
          bsStyle: 'link'
        }}
        views={[
          ViewTemplates.rootFolder,
          ViewTemplates.sharedFolders,
          ViewTemplates.starredFolders,
          ViewTemplates.recent
        ]}
      />
    );
  },

  _isAuthorized() {
    return (
      this.props.account &&
      !_.isEmpty(this.props.account.get('accessToken')) &&
      !_.isEmpty(this.props.account.get('refreshToken')) &&
      !_.isEmpty(this.props.account.get('email'))
    );
  }
});
