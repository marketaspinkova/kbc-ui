import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { ExternalLink } from '@keboola/indigo-ui';
import EditButtons from '../../../react/common/EditButtons';
import AuthorizationRow from '../../oauth-v2/react/AuthorizationRow';
import { deleteCredentialsAndConfigAuth } from '../../oauth-v2/OauthUtils';
import { Steps, COMPONENT_ID } from '../constants';
import WizardButtons from './wizard/WizardButtons';
import InputAutoFocused from './wizard/AutoFocus';
import WizardCommon from './wizard/WizardCommon';
import WizardStep from './wizard/WizardStep';

export default createReactClass({
  propTypes: {
    step: PropTypes.string.isRequired,
    onStepChange: PropTypes.func.isRequired,
    oauthCredentials: PropTypes.object,
    oauthCredentialsId: PropTypes.string,
    isSaving: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onEditStart: PropTypes.func,
    onEditCancel: PropTypes.func,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    isConfigured: PropTypes.bool,
    isEditing: PropTypes.bool
  },

  render() {
    const userTimelineButtons = this.createButtons({
      previousAction: this.goToAuthorization,
      nextAction: this.goToMentions,
      nextActionEnabled: true
    });
    const mentionsButtons = this.createButtons({
      previousAction: this.goToUserTimeline,
      nextAction: this.goToFollowers,
      nextActionEnabled: true
    });
    const followersButtons = this.createButtons({
      previousAction: this.goToMentions,
      nextAction: this.goToSearch,
      nextActionEnabled: true
    });
    const searchButtons = this.createButtons({
      previousAction: this.goToFollowers,
      saveAction: this.props.onSave
    });
    return (
      <WizardCommon activeStep={this.props.step} goToStep={this.goToStep}>
        {this.authorizationStep()}
        <WizardStep step={Steps.STEP_USER_TIMELINE} title="User Timeline" buttons={userTimelineButtons}>
          <div className="col-md-8">
            <InputAutoFocused
              currentStep={this.props.step}
              value={this.props.settings.get('userTimelineScreenName')}
              onChange={this.onUserTimelineChange}
              label="Screen name"
              help="User timeline will be fetched."
              disabled={this.isStatic()}
            />
          </div>
        </WizardStep>
        <WizardStep step={Steps.STEP_MENTIONS} title="Mentions" buttons={mentionsButtons}>
          <div className="col-md-8">
            <p>Mentions of an authorized user will be fetched.</p>
          </div>
        </WizardStep>
        <WizardStep step={Steps.STEP_FOLLOWERS} title="Followers List" buttons={followersButtons}>
          <div className="col-md-8">
            <InputAutoFocused
              currentStep={this.props.step}
              value={this.props.settings.get('followersScreenName')}
              onChange={this.onFollowersChange}
              label="Screen name"
              autoFocus={true}
              help="Account's followers will be fetched."
              disabled={this.isStatic()}
            />
          </div>
        </WizardStep>
        <WizardStep step={Steps.STEP_SEARCH} title="Search Tweets" buttons={searchButtons}>
          <div className="col-md-8">
            <InputAutoFocused
              currentStep={this.props.step}
              value={this.props.settings.getIn(['search', 'query'])}
              onChange={this.onSearchQueryChange}
              label="Query"
              autoFocus={true}
              disabled={this.isStatic()}
              help={(
                <span>
                  Read more about searching in the{' '}
                  <ExternalLink href="https://developer.twitter.com/en/docs/tweets/search/overview">
                    documentation.
                  </ExternalLink>
                </span>
              )}
            />
          </div>
        </WizardStep>
      </WizardCommon>
    );
  },

  authorizationStep() {
    if (this.props.isConfigured) {
      return null;
    }

    const buttons = (
      <WizardButtons
        isSaving={this.props.isSaving}
        componentId={this.props.componentId}
        configId={this.props.configId}
        nextAction={this.goToUserTimeline}
        nextActionEnabled={!!this.props.oauthCredentials}
      />
    );

    return (
      <WizardStep step={Steps.STEP_AUTHORIZATION} title="Authorization" buttons={buttons}>
        <div className="col-md-12">
          <AuthorizationRow
            id={this.props.oauthCredentialsId}
            configId={this.props.configId}
            componentId={COMPONENT_ID}
            credentials={this.props.oauthCredentials}
            isResetingCredentials={false}
            onResetCredentials={this.deleteCredentials}
            showHeader={false}
          />
        </div>
      </WizardStep>
    );
  },

  createButtons(options) {
    const defaults = Map({
      isSaving: this.props.isSaving,
      componentId: this.props.componentId,
      configId: this.props.configId
    });
    if (this.props.isConfigured) {
      return (
        <EditButtons
          editLabel="Edit Settings"
          isEditing={this.props.isEditing}
          isSaving={this.props.isSaving}
          onCancel={this.props.onEditCancel}
          onSave={this.props.onSave}
          onEditStart={this.props.onEditStart}
        />
      );
    } else {
      return <WizardButtons {...defaults.merge(Map(options)).toJS()} />;
    }
  },

  goToAuthorization() {
    this.goToStep(Steps.STEP_AUTHORIZATION);
  },

  goToMentions() {
    this.goToStep(Steps.STEP_MENTIONS);
  },

  goToUserTimeline() {
    this.goToStep(Steps.STEP_USER_TIMELINE);
  },

  goToFollowers() {
    this.goToStep(Steps.STEP_FOLLOWERS);
  },

  goToSearch() {
    this.goToStep(Steps.STEP_SEARCH);
  },

  goToStep(step) {
    this.props.onStepChange(step);
  },

  onUserTimelineChange(e) {
    this.props.onChange(this.props.settings.set('userTimelineScreenName', e.target.value));
  },

  onFollowersChange(e) {
    this.props.onChange(this.props.settings.set('followersScreenName', e.target.value));
  },

  onSearchQueryChange(e) {
    this.props.onChange(this.props.settings.setIn(['search', 'query'], e.target.value));
  },

  isStatic() {
    return this.props.isConfigured && !this.props.isEditing;
  },

  deleteCredentials() {
    deleteCredentialsAndConfigAuth(this.props.componentId, this.props.configId);
  }

});
