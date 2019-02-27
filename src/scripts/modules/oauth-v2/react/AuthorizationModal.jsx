import React, {PropTypes} from 'react';
import InstantAuthorizationFields from './InstantAuthorizationFields';
import Clipboard from '../../../react/common/Clipboard';
import AuthorizationForm from './AuthorizationForm';
import DirectTokenInsertFields from './DirectTokenInsertFields';
import CustomAuthorizationFields from './CustomAuthorizationFields';
import * as oauthUtils from '../OauthUtils';
import {Loader, ExternalLink} from '@keboola/indigo-ui';
import { Alert, Button, ButtonToolbar, Modal, Tabs, Tab } from 'react-bootstrap';

const DIRECT_TOKEN_COMPONENTS = ['keboola.ex-facebook', 'keboola.ex-facebook-ads', 'keboola.ex-instagram'];

const CUSTOM_AUTHORIZATION_COMPONENTS = ['keboola.ex-google-analytics-v4'];

const COMPONENT_LIMITS_INFO = {'keboola.ex-google-analytics-v4': 'Number of requests will be limited to 2000 API calls per day. Use Custom Authorization with your own credentials to obtain full access to the API.'};

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    allowExternalAuthorization: PropTypes.bool,
    returnUrlSuffix: PropTypes.string,
    show: PropTypes.bool,
    onHideFn: PropTypes.func
  },

  getInitialState() {
    return {
      direct: {},
      custom: {},
      instant: {},
      externalLink: '',
      generatingLink: false,
      activeTab: 'instant'
    };
  },

  render() {
    return (
      <Modal
        className="kbc-authorization-modal"
        show={this.props.show}
        onHide={this.props.onHideFn}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Authorize
          </Modal.Title>
        </Modal.Header>

        <AuthorizationForm
          returnUrlSuffix={this.props.returnUrlSuffix}
          componentId={this.props.componentId}
          id={this.props.id}
        >
          <Modal.Body>
            <Tabs
              id="authorizationrowtabs"
              activeKey={this.state.activeTab}
              onSelect={this.goToTab}
              animation={false}
              className="tabs-inside-modal"
            >
              <Tab eventKey="instant" title="Instant authorization">
                {this.renderInstant()}
              </Tab>
              {this.props.allowExternalAuthorization &&
                <Tab eventKey="external" title="External authorization">
                  {this.renderExternal()}
                </Tab>
              }
              {DIRECT_TOKEN_COMPONENTS.includes(this.props.componentId) && (
                <Tab key="direct" eventKey="direct" title="Direct token insert">
                  {this.renderDirectTokenInsert()}
                </Tab>
              )}
              {CUSTOM_AUTHORIZATION_COMPONENTS.includes(this.props.componentId) && (
                <Tab key="custom" eventKey="custom" title="Custom authorization">
                  {this.renderCustom()}
                </Tab>
              )}
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            {this.renderFooterButtons()}
          </Modal.Footer>
        </AuthorizationForm>
      </Modal>
    );
  },

  getLimitsInfo() {
    if (COMPONENT_LIMITS_INFO.hasOwnProperty(this.props.componentId)) {
      return COMPONENT_LIMITS_INFO[this.props.componentId];
    }
    return null;
  },

  renderFooterButtons() {
    if (this.state.activeTab === 'instant') return this.renderInstantButtons();
    if (this.state.activeTab === 'external') return this.renderExternalButtons();
    if (this.state.activeTab === 'direct') return this.renderDirectButtons();
    if (this.state.activeTab === 'custom') return this.renderCustomButtons();
  },

  renderExternal() {
    const externalLink = this.state.externalLink ? (
      <pre>
        <ExternalLink href={this.state.externalLink}>
          {this.state.externalLink}
        </ExternalLink>
        <div style={{paddingTop: '10px'}}>
          <Clipboard text={this.state.externalLink} label="Copy link to clipboard" />
        </div>
      </pre>
    ) : null;
    return (
      <div>
        {!!this.getLimitsInfo() && (
          <Alert bsStyle="warning">{this.getLimitsInfo()}</Alert>
        )}
        <p>
          To authorize an account from a non-Keboola Connection user, generate a link to the external authorization app and send it to the user you want to have the authorized account for. The generated link is valid for <strong>48</strong> hours and will not be stored anywhere.
        </p>
        {externalLink}
      </div>
    );
  },

  onGetExternalLink() {
    this.setState({generatingLink: true});
    oauthUtils
      .generateLink(this.props.componentId, this.props.configId)
      .then((link) => {
        this.setState({generatingLink: false, externalLink: link});
      });
  },

  renderExternalButtons() {
    return (
      <ButtonToolbar>
        {(this.state.generatingLink ? <Loader /> : null)}
        <Button
          bsStyle="link"
          onClick={this.props.onHideFn}>Cancel
        </Button>
        <Button
          type="button"
          disabled={this.state.generatingLink}
          bsStyle="success"
          onClick={this.onGetExternalLink}>
          {(this.state.externalLink ? 'Regenerate Link' : 'Generate Link')}
        </Button>
      </ButtonToolbar>
    );
  },

  onSaveDirectToken() {
    const {direct} = this.state;
    const data = {
      token: direct.token
    };
    this.setDirectState('saving', true);
    oauthUtils.saveDirectData(this.props.componentId, this.props.configId, direct.authorizedFor, data).then(() => {
      this.setState(this.getInitialState());
      this.props.onHideFn();
    });
  },

  isDirectTokenFormValid() {
    const {direct} = this.state;
    return !!direct.token && !!direct.authorizedFor;
  },

  renderDirectButtons() {
    const {direct} = this.state;
    return (
      <ButtonToolbar>
        {(direct.saving ? <Loader /> : null)}
        <Button
          disabled={direct.saving}
          bsStyle="link"
          onClick={this.props.onHideFn}>Cancel
        </Button>
        <Button
          bsStyle="success"
          onClick={this.onSaveDirectToken}
          type="button"
          disabled={!this.isDirectTokenFormValid() || direct.saving}
        >Save
        </Button>
      </ButtonToolbar>
    );
  },

  setDirectState(prop, value) {
    const {direct} = this.state;
    direct[prop] = value;
    this.setState({'direct': direct});
  },

  renderDirectTokenInsert() {
    const {direct} = this.state;
    return (
      <DirectTokenInsertFields
        token={direct.token}
        authorizedFor={direct.authorizedFor}
        onChangeProperty={this.setDirectState}
        componentId={this.props.componentId}
      />
    );
  },

  renderInstant() {
    return (
      <InstantAuthorizationFields
        disabled={this.state.activeTab !== 'instant'}
        authorizedFor={this.state.instant.authorizedFor}
        componentId={this.props.componentId}
        onChangeFn={this.setInstantState}
        infoText={this.getLimitsInfo()}
      />
    );
  },

  renderInstantButtons() {
    return (
      <ButtonToolbar>
        <Button
          bsStyle="link"
          onClick={this.props.onHideFn}>Cancel
        </Button>
        <Button
          bsStyle="success"
          type="submit"
          disabled={!this.state.instant.authorizedFor}
        ><span>Authorize</span>
        </Button>
      </ButtonToolbar>
    );
  },

  setInstantState(prop, value) {
    const {instant} = this.state;
    instant[prop] = value;
    this.setState({'instant': instant});
  },

  renderCustom() {
    const {custom} = this.state;
    return (
      <CustomAuthorizationFields
        appKey={custom.appKey}
        appSecret={custom.appSecret}
        authorizedFor={custom.authorizedFor}
        componentId={this.props.componentId}
        onChangeFn={this.setCustomState}
        disabled={this.state.activeTab !== 'custom'}
      />
    );
  },

  renderCustomButtons() {
    return (
      <ButtonToolbar>
        <Button
          bsStyle="link"
          onClick={this.props.onHideFn}>Cancel
        </Button>
        <Button
          bsStyle="success"
          type="submit"
          disabled={!this.isCustomFormValid()}
        ><span>Authorize</span>
        </Button>
      </ButtonToolbar>
    );
  },

  setCustomState(prop, value) {
    const {custom} = this.state;
    custom[prop] = value;
    this.setState({'custom': custom});
  },

  isCustomFormValid() {
    const {custom} = this.state;
    return !!custom.appKey && !!custom.authorizedFor && !!custom.appSecret;
  },

  goToTab(tab) {
    this.setState({
      activeTab: tab
    });
  }
});
