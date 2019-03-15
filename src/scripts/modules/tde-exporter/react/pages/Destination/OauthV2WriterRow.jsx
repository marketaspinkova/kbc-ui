import PropTypes from 'prop-types';
import React, { Component } from 'react';
import createReactClass from 'create-react-class';
import {Map} from 'immutable';
import {Loader} from '@keboola/indigo-ui';
import AuthorizationRow from '../../../../oauth-v2/react/AuthorizationRow';
import OAuthV2Actions from '../../../../oauth-v2/ActionCreators';
import {FormGroup} from 'react-bootstrap';
import {FormControl} from 'react-bootstrap';
import {ControlLabel} from 'react-bootstrap';
import Picker from '../../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../../google-utils/react/PickerViewTemplates';

const FormControlStatic = FormControl.Static;

class OauthV2WriterRow extends Component {
  constructor(props) {
    super(props);
    this.deleteCredentials = this.deleteCredentials.bind(this);
  }

  render() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <form className="form form-horizontal">
          <FormGroup>
            <ControlLabel className="col-sm-2">
              Destination
            </ControlLabel>
            <FormControlStatic className="col-sm-10" componentClass="div">
              {this.props.renderComponent()}
            </FormControlStatic>
          </FormGroup>
        </form>
        <div className="form form-horizontal">
          <FormGroup>
            <ControlLabel className="col-sm-2">
              Authorization Status
            </ControlLabel>
            <FormControlStatic className="col-sm-10" componentClass="div">
              {this.renderAuthorizedInfo()}
            </FormControlStatic>
          </FormGroup>
        </div>
        {this.props.isAuthorized && this.props.componentId === 'keboola.wr-google-drive' &&
         <div className="form form-horizontal">
           <FormGroup>
             <ControlLabel className="col-sm-2">
               Folder
             </ControlLabel>
             <FormControlStatic className="col-sm-10" componentClass="div">
               {this.renderGdriveFolder()}
               {this.renderGdriveFolderPicker()}
             </FormControlStatic>
           </FormGroup>
         </div>
        }
        {this.props.isAuthorized &&
         <form className="form form-horizontal">
           <FormGroup>
             <ControlLabel className="col-sm-2">
               Instant Upload
             </ControlLabel>
             <FormControlStatic className="col-sm-10" componentClass="div">
               {this.props.renderEnableUpload(this.props.oauthCredentials.get('authorizedFor'))}
             </FormControlStatic>
           </FormGroup>
         </form>
        }
      </div>
    );
  }

  saveGdriveFolder(id, title) {
    const path = ['parameters', this.props.componentId];
    let data = this.props.componentData.set('folder', Map());
    if (id) {
      data = this.props.componentData
        .setIn(['folder', 'id'], id)
        .setIn(['folder', 'title'], title);
    }
    this.props.updateLocalState([this.props.componentId, 'saving'], true);
    return this.props.setConfigDataFn(path, data).then(() =>
      this.props.updateLocalState([this.props.componentId, 'saving'], false)
    );
  }

  renderGdriveFolder() {
    const folderName = this.props.componentData.getIn(['folder', 'title'], '/') || '/';
    const folderId = this.props.componentData.getIn(['folder', 'id']);
    const isSaving = this.props.localState.getIn([this.props.componentId, 'saving'], false);
    if (isSaving) return <div><Loader/></div>;
    return (
      <div>
        <strong>
          {folderName}
        </strong>
        {folderId &&
         <span
           onClick={() => this.saveGdriveFolder(null, null)}
           style={{paddingTop: '0px', paddingBottom: '0px'}}
           className="btn btn-link btn-sm">Reset
         </span>
        }
      </div>
    );
  }

  renderGdriveFolderPicker() {
    /* const file = this.props.componentData.get('folder');
     * const folderId = file.get('id');
     * const folderName = file.get('title');*/

    return (
      <Picker
        dialogTitle="Select a folder"
        buttonLabel={
          <span>
            <span className="fa fa-fw fa-folder-o" />Select a folder
          </span>
        }
        onPickedFn={
          (data) => {
            let foldersData = data.filter((file) => file.type === 'folder');
            const folderId = foldersData[0].id;
            const folderName = foldersData[0].name;
            foldersData[0].title = folderName;
            return this.saveGdriveFolder(folderId, folderName);
          }
        }
        buttonProps={{bsStyle: 'link'}}
        views={[
          ViewTemplates.rootFolder,
          ViewTemplates.sharedFolders,
          ViewTemplates.starredFolders,
          ViewTemplates.recent
        ]}
      />);
  }

  renderAuthorizedInfo() {
    const credentialsId = `tde-${this.props.configId}`;
    return (
      <AuthorizationRow
        returnUrlSuffix={`oauth-redirect-${this.props.componentId}`}
        className={''}
        innerComponent={'div'}
        allowExternalAuthorization={false}
        id={credentialsId}
        configId={this.props.configId}
        componentId={this.props.componentId}
        credentials={this.props.oauthCredentials}
        isResetingCredentials={false}
        onResetCredentials={this.deleteCredentials}
        showHeader={false}
      />
    );
  }

  deleteCredentials() {
    OAuthV2Actions.deleteCredentials(this.props.componentId, `tde-${this.props.configId}`)
      .then(this.props.resetUploadTask);
  }
}
OauthV2WriterRow.propTypes = {
  configId: PropTypes.string.isRequired,
  componentData: PropTypes.object.isRequired,
  oauthCredentials: PropTypes.object,
  componentId: PropTypes.string.isRequired,
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func,
  setConfigDataFn: PropTypes.func,
  renderComponent: PropTypes.func,
  renderEnableUpload: PropTypes.func,
  isAuthorized: PropTypes.bool,
  resetUploadTask: PropTypes.func
};
export default OauthV2WriterRow;
