import React from 'react';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    authorizedFor: React.PropTypes.string,
    appKey: React.PropTypes.string,
    appSecret: React.PropTypes.string,
    componentId: React.PropTypes.string.isRequired,
    onChangeFn: React.PropTypes.func,
    disabled: React.PropTypes.bool
  },

  render() {
    return (
      <div>
        <p>
          Provide your own OAuth 2.0 credentials from <ExternalLink href="https://console.developers.google.com">Google API Console</ExternalLink>.
          <br />
          Follow these <ExternalLink href="https://help.keboola.com/extractors/marketing-sales/google-analytics/#custom-oauth-credentials">instructions</ExternalLink> to set up an application and obtain a pair of credentials.
        </p>
        <div className="form-group">
          <label className="control-label col-sm-3">
            Description
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="authorizedFor"
              defaultValue={this.props.authorizedFor}
              onChange={(e) => this.props.onChangeFn('authorizedFor', e.target.value)}
              autoFocus={true}
              disabled={this.props.disabled}
            />
            <p className="help-block">
              Describe this authorization, e.g. by the account name.
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-3">
            Client ID
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="appKey"
              defaultValue={this.props.appKey}
              onChange={(e) => this.props.onChangeFn('appKey', e.target.value)}
              disabled={this.props.disabled}
            />
            <p className="help-block">
              Client ID of your app
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-3">
            Client secret
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="appSecret"
              defaultValue={this.props.appSecret}
              onChange={(e) => this.props.onChangeFn('appSecret', e.target.value)}
              disabled={this.props.disabled}
            />
            <p className="help-block">
              Client secret of your app
            </p>
          </div>
        </div>
      </div>
    );
  }
});
