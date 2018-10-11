import React from 'react';
import { Protected, Loader, ExternalLink } from '@keboola/indigo-ui';
import Clipboard from '../../../../react/common/Clipboard';
import ValidUntilWithIcon from '../../../../react/common/ValidUntilWithIcon';

export default React.createClass({
  propTypes: {
    credentials: React.PropTypes.object,
    validUntil: React.PropTypes.number,
    isCreating: React.PropTypes.bool,
    hideClipboard: React.PropTypes.bool
  },

  getDefaultProps() {
    return { hideClipboard: false };
  },

  render() {
    return <div>{this._renderSandbox()}</div>;
  },

  _renderSandbox() {
    if (this.props.isCreating) {
      return (
        <span>
          <Loader />
          &nbsp;Creating sandbox
        </span>
      );
    }

    if (this.props.credentials.get('id')) {
      return this._renderCredentials();
    }

    return 'Sandbox not running';
  },

  _renderCredentials() {
    return (
      <div>
        <p className="small">
          {'Use these credentials to connect to the sandbox with your favourite SQL client (we like '}
          <ExternalLink href="http://www.sequelpro.com/download">Sequel Pro</ExternalLink>
          ). You can also use the Adminer web application provided by Keboola (click on Connect).
        </p>
        <div className="row">
          <span className="col-md-3">Host</span>
          <span className="col-md-9">
            {this.props.credentials.get('hostname')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('hostname')} />}
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Port</span>
          <span className="col-md-9">
            3306
            {!this.props.hideClipboard && <Clipboard text="3306" />}
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">User</span>
          <span className="col-md-9">
            {this.props.credentials.get('user')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('user')} />}
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Password</span>
          <span className="col-md-9">
            <Protected>{this.props.credentials.get('password')}</Protected>
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('password')} />}
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Database</span>
          <span className="col-md-9">
            {this.props.credentials.get('db')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('db')} />}
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Expires</span>
          <span className="col-md-9">
            <ValidUntilWithIcon validUntil={this.props.validUntil} />
          </span>
        </div>
      </div>
    );
  }
});
