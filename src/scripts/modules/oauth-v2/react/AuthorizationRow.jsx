import React, { PropTypes } from 'react';
import moment from 'moment';
import { fromJS } from 'immutable';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Confirm from '../../../react/common/Confirm';
import Tooltip from '../../../react/common/Tooltip';
import EmptyState from '../../components/react/components/ComponentEmptyState';
import ApplicationStore from '../../../stores/ApplicationStore';
import AuthorizationModal from './AuthorizationModal';
import oauthActions from '../ActionCreators';
import * as OauthUtils from '../OauthUtils';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    credentials: PropTypes.object,
    onResetCredentials: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    allowExternalAuthorization: PropTypes.bool,
    className: PropTypes.string,
    isResetingCredentials: PropTypes.bool,
    innerComponent: PropTypes.any,
    returnUrlSuffix: PropTypes.string,
    showHeader: PropTypes.bool
  },

  getInitialState() {
    return {
      showModal: false,
      linkingCredentials: false,
      notLinkedCredentials: null
    };
  },

  getDefaultProps() {
    return {
      showHeader: true,
      innerComponent: EmptyState,
      allowExternalAuthorization: true,
      returnUrlSuffix: 'oauth-redirect'
    };
  },

  componentDidMount() {
    if (!this.isAuthorized()) {
      this.lookupForNotLinkedCredentials();
    }
  },

  render() {
    return (
      <div className={this.props.className}>
        {this.renderAuthorizationModal()}
        {this.renderHeader()}
        {this.isAuthorized() ? this.renderAuthorizedInfo() : this.renderAuth()}
      </div>
    );
  },

  renderHeader() {
    if (!this.props.showHeader) {
      return null;
    }

    return <h2>Authorization</h2>;
  },

  renderAuth() {
    const InnerComponent = this.props.innerComponent;

    return (
      <InnerComponent>
        <p>No Account authorized</p>
        <Button bsStyle="success" onClick={this.showModal} disabled={this.state.linkingCredentials}>
          <i className="fa fa-fw fa-user" /> Authorize Account
        </Button>
        {this.state.notLinkedCredentials && this.renderLinkExistingCredentials()}
      </InnerComponent>
    );
  },

  renderAuthorizedInfo() {
    const created = this.props.credentials.get('created');
    const createdInfo = (
      <Tooltip tooltip={created} placement="top">
        <span>
          {moment(created).fromNow()}
        </span>
      </Tooltip>
    );
    const creator = this.props.credentials.getIn(['creator', 'description']);

    return (
      <div>
        Authorized for <strong>{this.props.credentials.get('authorizedFor')}</strong>
        {!this.props.isResetingCredentials ? (
          <Confirm
            text="Do you really want to reset the authorized account?"
            title="Reset Authorization"
            buttonLabel="Reset"
            onConfirm={this.props.onResetCredentials}
          >
            <a className="btn btn-link btn-sm" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Tooltip tooltip="Reset Authorization" placement="top">
                <span> Reset</span>
              </Tooltip>
            </a>
          </Confirm>
        ) : (
          <span>
            {' '}
            <Loader />
          </span>
        )}
        <div className="small">
          {createdInfo} by {creator}
        </div>
      </div>
    );
  },

  renderAuthorizationModal() {
    return (
      <AuthorizationModal
        componentId={this.props.componentId}
        allowExternalAuthorization={this.props.allowExternalAuthorization}
        id={this.props.id}
        configId={this.props.configId}
        show={this.state.showModal}
        onHideFn={this.hideModal}
        returnUrlSuffix={this.props.returnUrlSuffix}
      />
    );
  },

  renderLinkExistingCredentials() {
    const creator = this.state.notLinkedCredentials.get('creator');

    return (
      <div>
        <br />
        <p>
          or link existing authorization (<b>{creator.get('description')}</b>)
        </p>
        <Button bsStyle="success" onClick={this.linkCredentials} disabled={this.state.linkingCredentials}>
          {this.state.linkingCredentials ? (
            <Loader />
          ) : (
            <i className="fa fa-fw fa-link" />
          )}{' '}
          Link Existing
        </Button>
      </div>
    );
  },

  lookupForNotLinkedCredentials() {
    oauthActions
        .loadCredentialsForce(this.props.componentId, this.props.configId)
        .then((data) => fromJS(data))
        .then((credentials) => {
          if (parseInt(credentials.getIn(['creator', 'id']), 10) === parseInt(ApplicationStore.getCurrentAdmin().get('id'), 10)) {
            this.setState({
              notLinkedCredentials: credentials
            });
          }
        })
  },

  isAuthorized() {
    const creds = this.props.credentials;
    return  creds && creds.has('id');
  },

  hideModal() {
    this.setState(
      {showModal: false}
    );
  },

  showModal() {
    this.setState(
      {showModal: true}
    );
  },

  linkCredentials() {
    this.setState({ linkingCredentials: true });
    OauthUtils
      .linkCredentials(this.props.componentId, this.props.configId, this.state.notLinkedCredentials)
      .finally(() => {
        this.setState({ linkingCredentials: true });
      })
  }
});
