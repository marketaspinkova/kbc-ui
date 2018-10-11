import React from 'react';
import {Protected, Loader} from '@keboola/indigo-ui';
import Clipboard from '../../../../react/common/Clipboard';
import ValidUntilWithIcon from '../../../../react/common/ValidUntilWithIcon';

module.exports = React.createClass({
  displayName: 'JupyterCredentials',
  propTypes: {
    credentials: React.PropTypes.object,
    validUntil: React.PropTypes.number,
    isCreating: React.PropTypes.bool
  },
  render: function() {
    if (this.props.isCreating) {
      return (
        <div>
          <span>
            <Loader />
            &nbsp;Creating sandbox
          </span>
        </div>
      );
    } else if (this.props.credentials.get('id')) {
      return (
        <div>
          {this._renderCredentials()}
        </div>
      );
    } else {
      return (
        <div>
          Sandbox not running
        </div>
      );
    }
  },
  _renderCredentials: function() {
    return (
      <span>
        <div className="row">
          <span className="col-md-3">Password</span>
          <span className="col-md-9">
            <Protected>{this.props.credentials.get('password')}</Protected>
            <Clipboard text={this.props.credentials.get('password')}/>
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Expires</span>
          <span className="col-md-9">
            <ValidUntilWithIcon validUntil={this.props.validUntil}/>
          </span>
        </div>
      </span>
    );
  }
});

