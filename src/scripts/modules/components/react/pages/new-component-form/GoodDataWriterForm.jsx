import React from 'react';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import contactSupport from '../../../../../utils/contactSupport';
import { Modal, ButtonToolbar, Button, FormGroup, FormControl, Col, Radio, ControlLabel, HelpBlock } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';
import { GoodDataWriterModes, GoodDataWriterTokenTypes } from '../../../Constants';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired,
    configuration: React.PropTypes.object.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    isValid: React.PropTypes.bool.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      canCreateProdProject: !!ApplicationStore.getCurrentProject().getIn([
        'limits',
        'goodData.prodTokenEnabled',
        'value'
      ])
    };
  },

  _handleChange(propName, event) {
    this.props.onChange(this.props.configuration.set(propName, event.target.value));
  },

  render() {
    return (
      <div>
        <Modal.Header className="modal-configuration-header" closeButton={true} onHide={this.props.onClose}>
          <div className="row">
            <div className="col-xs-3">
              <ComponentIcon component={this.props.component} className="modal-configuration-icon" size="64" />
            </div>
            <div className="col-xs-9">
              <h2 className="modal-configuration-title">
                <ComponentName component={this.props.component} />
              </h2>
              <p>{this.props.component.get('description')}</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="modal-configuration-body">
          <form className="form-horizontal" onSubmit={this._handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={3}>Name</Col>
              <Col xs={9}>
                <FormControl
                  type="text"
                  value={this.props.configuration.get('name')}
                  placeholder={`My ${this.props.component.get('name')}`}
                  onChange={this._handleChange.bind(this, 'name')}
                  disabled={this.props.isSaving}
                  autoFocus
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={3}>Description</Col>
              <Col xs={9}>
                <FormControl
                  componentClass="textarea"
                  value={this.props.configuration.get('description')}
                  onChange={this._handleChange.bind(this, 'description')}
                  disabled={this.props.isSaving}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={9} smOffset={3}>
                <Radio
                  value={GoodDataWriterModes.NEW}
                  checked={this.props.configuration.get('mode') === GoodDataWriterModes.NEW}
                  onChange={this._handleChange.bind(this, 'mode')}
                  name="mode"
                >
                  Create new GoodData project
                </Radio>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={9} smOffset={3}>
                <Radio
                  value={GoodDataWriterModes.EXISTING}
                  checked={this.props.configuration.get('mode') === GoodDataWriterModes.EXISTING}
                  onChange={this._handleChange.bind(this, 'mode')}
                  name="mode"
                >
                  Use existing GoodData project
                </Radio>
              </Col>
            </FormGroup>
            {this.props.configuration.get('mode') === GoodDataWriterModes.NEW
              ? this._renderNewForm()
              : this._renderExistingForm()}
            {this._renderCustomDomainForm()}
            <p>
              {'By creating a config, you agree with the '}
              <ExternalLink href="http://www.gooddata.com/terms-of-use">GoodData terms and conditions.</ExternalLink>
            </p>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            {this.props.isSaving && (
              <span>
                <Loader />{' '}
              </span>
            )}
            <Button bsStyle="link" disabled={this.props.isSaving} onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button bsStyle="success" disabled={!this.props.isValid || this.props.isSaving} onClick={this.props.onSave}>
              Create Configuration
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </div>
    );
  },

  _renderCustomDomainForm() {
    return (
      <div>
        <div className="form-group">
          <div className="col-xs-offset-3 col-xs-9">
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.configuration.get('customDomain')}
                  onChange={() => {
                    return this.props.onChange(
                      this.props.configuration.set('customDomain', !this.props.configuration.get('customDomain'))
                    );
                  }}
                />
                {' Custom Domain'}
              </label>
            </div>
          </div>
        </div>
        {this.props.configuration.get('customDomain') && (
          <div>
            {this._renderInput('Name', 'domain', 'Name of your domain')}
            {this._renderInput('Login', 'username', 'Login of domain administrator')}
            {this._renderInput('Password', 'password', 'Password of domain administrator', true)}
            {this._renderInput('Backend url', 'backendUrl', 'https://secure.gooddata.com')}
            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <h3>Custom SSO</h3>
              </div>
            </div>
            {this._renderInput('Provider', 'ssoProvider', 'optional')}
            {this._renderInput('PGP Key', 'ssoKey', 'private key encoded in base64')}
            {this._renderInput('Key Passphrase', 'ssoKeyPass', 'optional')}
          </div>
        )}
      </div>
    );
  },

  _renderInput(label, prop, placeholder, isProtected) {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} xs={3}>{label}</Col>
        <Col xs={9}>
          <FormControl
            type={isProtected ? 'password' : 'text'}
            value={this.props.configuration.get(prop)}
            placeholder={placeholder}
            onChange={this._handleChange.bind(this, prop)}
            disabled={this.props.isSaving}
          />
        </Col>
      </FormGroup>
    );
  },

  _renderNewForm() {
    return (
      <div>
        <div className="form-group">
          <div className="col-xs-offset-3 col-xs-9">
            <h3>Auth token</h3>
          </div>
        </div>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Radio
              value={GoodDataWriterTokenTypes.PRODUCTION}
              checked={this.props.configuration.get('authToken') === GoodDataWriterTokenTypes.PRODUCTION}
              onChange={this._handleChange.bind(this, 'authToken')}
              disabled={!this.state.canCreateProdProject}
              name="tokenType"
            >
              Production
            </Radio>
            <HelpBlock>
              {this._renderProductionHelp()}
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Radio
              value={GoodDataWriterTokenTypes.DEMO}
              checked={this.props.configuration.get('authToken') === GoodDataWriterTokenTypes.DEMO}
              onChange={this._handleChange.bind(this, 'authToken')}
              name="tokenType"
            >
              Demo
            </Radio>
            <HelpBlock>
              max 1GB of data, expires in 1 month
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Radio
              value=""
              checked={this._isCustomToken()}
              onChange={this._handleChange.bind(this, 'authToken')}
              name="tokenType"
            >
              Custom
            </Radio>
            <HelpBlock>
              You have your own token
            </HelpBlock>
          </Col>
        </FormGroup>
        {this._isCustomToken() && (
          <FormGroup>
            <Col xs={9} xsOffset={3}>
              <FormControl
                type="text"
                placeholder="Your token"
                value={this.props.configuration.get('authToken')}
                onChange={this._handleChange.bind(this, 'authToken')}
              />
            </Col>
          </FormGroup>
        )}
      </div>
    );
  },

  _isCustomToken() {
    const isDemo = this.props.configuration.get('authToken') === GoodDataWriterTokenTypes.DEMO;
    const isProduction = this.props.configuration.get('authToken') === GoodDataWriterTokenTypes.PRODUCTION;
    return !isDemo && !isProduction;
  },

  _renderProductionHelp() {
    return (
      <span>
        You are paying for it
        {!this.state.canCreateProdProject && (
          <div>
            {'Please '}
            <a onClick={contactSupport}>contact support</a>
            {' to enable the production project.'}
          </div>
        )}
      </span>
    );
  },

  _renderExistingForm() {
    return (
      <div>
        <div className="col-xs-offset-3 col-xs-9">
          <h3>GoodData Project Admin Credentials</h3>
        </div>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={3}>Username</Col>
          <Col xs={9}>
            <FormControl
              type="text"
              value={this.props.configuration.get('username')}
              onChange={this._handleChange.bind(this, 'username')}
              disabled={this.props.isSaving || this.props.configuration.get('customDomain')}
              placeholder={this.props.configuration.get('customDomain') && 'Will be copied from custom domain Login'}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={3}>Password</Col>
          <Col xs={9}>
            <FormControl
              type="password"
              value={this.props.configuration.get('password')}
              onChange={this._handleChange.bind(this, 'password')}
              disabled={this.props.isSaving || this.props.configuration.get('customDomain')}
              placeholder={this.props.configuration.get('customDomain') && 'Will be copied from custom domain Password'}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={3}>Project Id</Col>
          <Col xs={9}>
            <FormControl
              type="text"
              value={this.props.configuration.get('pid')}
              onChange={this._handleChange.bind(this, 'pid')}
              disabled={this.props.isSaving}
            />
          </Col>
        </FormGroup>
        <div className="form-group">
          <div className="col-xs-offset-3 col-xs-9">
            <label>
              <input
                type="checkbox"
                checked={this.props.configuration.get('readModel')}
                onChange={e => {
                  return this.props.onChange(this.props.configuration.set('readModel', e.target.checked));
                }}
              />
              {' Read a project model to the writer configuration'}
            </label>
            <p className="help-block">
              {'If checked, data bucket '}
              <code>{'out.c-wr-gooddata-{writer_name}'}</code>
              {' will be created along with the configuration. The bucket cannot exist yet.'}
            </p>
          </div>
        </div>
      </div>
    );
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this.props.isValid) {
      this.props.onSave();
    }
  }
});
