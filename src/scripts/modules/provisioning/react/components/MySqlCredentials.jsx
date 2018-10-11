import React from 'react';
import { Protected, Loader } from '@keboola/indigo-ui';
import Clipboard from '../../../../react/common/Clipboard';
import ValidUntilWithIcon from '../../../../react/common/ValidUntilWithIcon';

const MySqlCredentials = React.createClass({
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
          <Loader /> Creating sandbox
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
          <a href="http://www.sequelpro.com/download" target="_blank">
            Sequel Pro
          </a>
          ). You can also use the Adminer web application provided by Keboola (click on Connect).
        </p>
        <div className="row">
          <span className="col-md-3">Host</span>
          <strong className="col-md-9">
            {this.props.credentials.get('hostname')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('hostname')} />}
          </strong>
        </div>
        <div className="row">
          <span className="col-md-3">Port</span>
          <strong className="col-md-9">
            3306
            {!this.props.hideClipboard && <Clipboard text="3306" />}
          </strong>
        </div>
        <div className="row">
          <span className="col-md-3">User</span>
          <strong className="col-md-9">
            {this.props.credentials.get('user')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('user')} />}
          </strong>
        </div>
        <div className="row">
          <span className="col-md-3">Password</span>
          <strong className="col-md-9">
            <Protected>{this.props.credentials.get('password')}</Protected>
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('password')} />}
          </strong>
        </div>
        <div className="row">
          <span className="col-md-3">Database</span>
          <strong className="col-md-9">
            {this.props.credentials.get('db')}
            {!this.props.hideClipboard && <Clipboard text={this.props.credentials.get('db')} />}
          </strong>
        </div>
        <div className="row">
          <span className="col-md-3">Expires</span>
          <strong className="col-md-9">
            <ValidUntilWithIcon validUntil={this.props.validUntil} />
          </strong>
        </div>
      </div>
    );
  }
});

export default MySqlCredentials;
