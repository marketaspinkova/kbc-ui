import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';
import { Check } from '@keboola/indigo-ui';
import {List, Map} from 'immutable';

import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import ComponentsSelector from './ComponentsSelector';
import BucketsSelector from './BucketsSelector.jsx';
import ExpiresInEdit from './ExpiresInEdit';
import ExpiresInfo from './ExpiresInfo';

const getAllComponents = () => {
  const allComponents = ComponentsStore.getAll();
  const newOrchestratorFlags = allComponents.getIn(['orchestrator', 'flags'], List()).filter((flag) => {
    return flag !== 'excludeFromNewList';
  });
  return allComponents
    .setIn(['orchestrator', 'id'], 'orchestrator')
    .setIn(['orchestrator', 'name'], 'Orchestrator')
    .setIn(['orchestrator', 'flags'], newOrchestratorFlags);
};

export default createReactClass({

  propTypes: {
    disabled: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    token: PropTypes.object.isRequired,
    allBuckets: PropTypes.object.isRequired,
    updateToken: PropTypes.func.isRequired
  },

  render() {
    const isCustomAccess = !this.props.token.get('canManageBuckets', false);
    const isAdminToken = this.props.token.has('admin');
    return (
      <div>
        {this.renderFormGroup(
          'Description',
          <div className="col-sm-9">
            {this.renderDescriptionInput()}
          </div>
        )}
        {this.renderFormGroup(
          'Expires In',
          isAdminToken ?
            <div className="col-sm-9">
              <p className="form-control-static">
               This is a user admin token that is valid as long as the user exists.
              </p>
            </div>
            :
            this.renderCustomExpires()
        )}
        {this.props.isEditing && this.renderFormGroup(
          'Created',
          <div className="col-sm-9">
            <p className="form-control-static">
              <CreatedWithIcon createdTime={this.props.token.get('created')} />
              {this.renderCreatorTokenLink()}
            </p>
          </div>
        )}
        {this.renderFormGroup(
          'Files',
          this.renderFileUploadsAccessInput()
        )}
        {this.renderFormGroup(
          'Components & Buckets',
          this.renderBucketsAndComponentsAccessInput()
        )}
        {isCustomAccess && this.renderFormGroup(
          '',
          <div className="col-sm-offset-3 col-sm-9">
            <ComponentsSelector
              disabled={this.props.disabled}
              onChange={(components) => this.props.updateToken('componentAccess', components)}
              selectedComponents={this.props.token.get('componentAccess', List())}
              allComponents={getAllComponents()}
            />
            <span className="help-block">
               Token can run selected components
            </span>
          </div>
        )}
        {isCustomAccess && this.renderFormGroup(
          '',
          <BucketsSelector
            disabled={this.props.disabled}
            bucketPermissions={this.props.token.get('bucketPermissions', Map())}
            onChange={(permissions) => this.props.updateToken('bucketPermissions', permissions)}
            allBuckets={this.props.allBuckets}
            permission="read"
            wrapperClassName="cols-sm-offset-3 col-sm-9"
          />
        )}
        {isCustomAccess && this.renderFormGroup(
          '',
          <BucketsSelector
            disabled={this.props.disabled}
            bucketPermissions={this.props.token.get('bucketPermissions', Map())}
            onChange={(permissions) => this.props.updateToken('bucketPermissions', permissions)}
            allBuckets={this.props.allBuckets}
            permission="write"
            wrapperClassName="cols-sm-offset-3 col-sm-9"
          />
        )}
        {this.props.isEditing && this.renderFormGroup(
          'Manage Tokens',
          <div className="col-sm-9">
            <p className="form-control-static">
              <Check isChecked={this.props.token.get('canManageTokens', false)} />
            </p>
            <p className="help-block">
              Token {this.props.token.get('canManageTokens', false) ? 'has' : 'hasn\'t'}
              {' '}permission to manage (e.g. create) other tokens.
            </p>
          </div>
        )}
      </div>
    );
  },

  renderCustomExpires() {
    return (
      this.props.isEditing ?
        <div className="col-sm-9">
          <p className="form-control-static">
            <ExpiresInfo withIcon={true} token={this.props.token} />
          </p>
        </div>
        :
        <ExpiresInEdit
          disabled={this.props.disabled}
          value={this.props.token.get('expiresIn', null)}
          onChange={(value) => this.props.updateToken('expiresIn', value)}
        />
    );
  },

  renderCreatorTokenLink() {
    const creatorToken = this.props.token.get('creatorToken', null);
    return creatorToken && (
      <span>
        {' '} by {' '}
        <Link to="tokens-detail" params={{tokenId: creatorToken.get('id')}}>
          {creatorToken.get('description')}
        </Link>
      </span>
    );
  },

  renderDescriptionInput() {
    return (
      <input
        autoFocus={!this.props.isEditing}
        placeholder="Describe token..."
        disabled={this.props.disabled}
        className="form-control"
        type="text"
        value={this.props.token.get('description')}
        onChange={(e) => this.props.updateToken('description', e.target.value)}
      />
    );
  },

  renderFormGroup(labelComponent, controlComponent) {
    return (
      <div className="form-group">
        <label className="control-label col-sm-3">
          {labelComponent}
        </label>
        {controlComponent}
      </div>
    );
  },

  renderFileUploadsAccessInput() {
    const isAdminToken = this.props.token.has('admin');
    const isFullAccess = this.props.token.get('canReadAllFileUploads', false);

    if (isAdminToken) {
      return (
        <div className="col-sm-9">
          <div className="radio">
            <label style={{'paddingLeft': '0px', 'cursor': 'default'}}>
              <span>Full Access</span>
            </label>
            <span className="help-block">
              Allow access to all files
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="col-sm-9">
        <div className="radio">
          <label>
            <input
              disabled={this.props.disabled}
              type="radio"
              checked={isFullAccess}
              onChange={() => this.props.updateToken('canReadAllFileUploads', true)}
            />
            <span>Full Access</span>
          </label>
        </div>
        <span className="help-block">
          Allow access to all files
        </span>
        <div className="radio">
          <label>
            <input
              disabled={this.props.disabled}
              type="radio"
              checked={!isFullAccess}
              onChange={() => this.props.updateToken('canReadAllFileUploads', false)}
            />
            <span>Restricted Access</span>
          </label>
        </div>
        <span className="help-block">
          Only files uploaded by the token are accessible
        </span>
      </div>
    );
  },

  renderBucketsAndComponentsAccessInput() {
    const {isEditing} = this.props;
    const radioLabelStyle = isEditing ? {'paddingLeft': '0px', 'cursor': 'default'} : {};
    const canManageBuckets = this.props.token.get('canManageBuckets', false);
    const showFull = !isEditing || (isEditing && canManageBuckets);
    const showCustom = !isEditing || (isEditing && !canManageBuckets);
    return (
      <div className="col-sm-9">
        {showFull &&
         <div className="radio">
           <label style={radioLabelStyle}>
             {!isEditing &&
              <input
                type="radio"
                disabled={this.props.disabled}
                checked={canManageBuckets}
                onChange={() => this.props.updateToken('canManageBuckets', true)}
              />
             }

             <span>Full Access</span>
           </label>
           <span className="help-block">
             Allow full access to all buckets and components including buckets created in future
           </span>
         </div>
        }
        {showCustom &&
         <div className="radio">
           <label style={radioLabelStyle}>
             {!isEditing &&
              <input
                disabled={this.props.disabled}
                type="radio"
                checked={!canManageBuckets}
                onChange={() => this.props.updateToken('canManageBuckets', false)}
              />
             }
             <span>Custom Access</span>
           </label>
           <span className="help-block">
             Only specified components and buckets will be accessible.
           </span>
         </div>
        }
      </div>
    );
  }

});
