import PropTypes from 'prop-types';
import React from 'react';
import { Protected, Loader } from '@keboola/indigo-ui';
import Clipboard from '../../../../react/common/Clipboard';
import ValidUntilWithIcon from '../../../../react/common/ValidUntilWithIcon';

export default React.createClass({
  propTypes: {
    credentials: PropTypes.object,
    validUntil: PropTypes.number,
    isCreating: PropTypes.bool
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
        <div className="row">
          <span className="col-md-3">User</span>
          <span className="col-md-9">
            {this.props.credentials.get('user')}
            <Clipboard text={this.props.credentials.get('user')} />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Password</span>
          <span className="col-md-9">
            <Protected>{this.props.credentials.get('password')}</Protected>
            <Clipboard text={this.props.credentials.get('password')} />
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
