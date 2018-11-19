import React from 'react';
import _ from 'underscore';
import { Form, Modal, Button, ButtonToolbar } from 'react-bootstrap';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { Input } from '../../../../react/common/KbcBootstrap';
import RouterStore from '../../../../stores/RoutesStore';

export default React.createClass({
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    redirectRouterPath: React.PropTypes.string,
    credentialsId: React.PropTypes.string,
    componentId: React.PropTypes.string,
    renderOpenButtonAsLink: React.PropTypes.bool
  },

  getInitialState() {
    return {
      oauthUrl: 'https://syrup.keboola.com/oauth/auth20',
      description: '',
      token: ApplicationStore.getSapiTokenString(),
      router: RouterStore.getRouter(),
      showModal: false
    };
  },

  getDefaultProps() {
    return { renderOpenButtonAsLink: false };
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  render() {
    return (
      <div>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Authorize Dropbox Account</Modal.Title>
          </Modal.Header>
          <Form horizontal method="POST" action={this.state.oauthUrl}>
            {this._createHiddenInput('api', this.props.componentId)}
            {this._createHiddenInput('id', this.props.credentialsId || this.props.configId)}
            {this._createHiddenInput('token', this.state.token)}
            {this._createHiddenInput('returnUrl', this._getRedirectUrl())}
            <Modal.Body>
              <Input
                label="Dropbox Email"
                type="text"
                ref="description"
                name="description"
                help="Used afterwards as a description of the authorized account"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-9"
                defaultValue={this.state.description}
                autoFocus={true}
                onChange={event => {
                  return this.setState({
                    description: event.target.value
                  });
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <ButtonToolbar>
                <Button onClick={this.close} bsStyle="link">
                  Cancel
                </Button>
                <Button bsStyle="success" type="submit" disabled={_.isEmpty(this.state.description)}>
                  <span>
                    <i className="fa fa-fw fa-dropbox" />
                    {' Authorize'}
                  </span>
                </Button>
              </ButtonToolbar>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  },

  renderOpenButton() {
    if (this.props.renderOpenButtonAsLink) {
      return (
        <span onClick={this.open} className="btn btn-link">
          <i className="fa fa-fw fa-user" />
          {' Authorize'}
        </span>
      );
    }

    return (
      <Button onClick={this.open} bsStyle="success">
        <i className="fa fa-fw fa-dropbox" />
        {' Authorize'}
      </Button>
    );
  },

  _createHiddenInput(name, value) {
    return <input name={name} type="hidden" value={value} />;
  },

  _getRedirectUrl() {
    const origin = ApplicationStore.getSapiUrl();
    const url = this.state.router.makeHref(this.props.redirectRouterPath, { config: this.props.configId });
    return `${origin}${url}`;
  }
});
