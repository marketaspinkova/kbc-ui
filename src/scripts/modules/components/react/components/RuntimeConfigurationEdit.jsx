import React, {PropTypes} from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import {Input} from './../../../../react/common/KbcBootstrap';
import SaveButtons from '../../../../react/common/SaveButtons';

export default React.createClass({
  propTypes: {
    data: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    saveLabel: PropTypes.string
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save configuration'
    };
  },

  onChangeRepository(e) {
    this.props.onChange(this.props.data.set('repository', e.target.value));
  },

  onChangeVersion(e) {
    this.props.onChange(this.props.data.set('version', e.target.value));
  },

  onChangeNetwork(e) {
    if (e.target.checked) {
      this.props.onChange(this.props.data.set('network', 'bridge'));
    } else {
      this.props.onChange(this.props.data.set('network', 'none'));
    }
  },

  onChangeUsername(e) {
    this.props.onChange(this.props.data.set('username', e.target.value));
  },

  onChangePassword(e) {
    this.props.onChange(this.props.data.set('#password', e.target.value));
  },

  render() {
    return (
      <div>
        <p className="help-block">This information should be provided by the application developer.</p>
        <div className="text-right" style={{padding: '1em 0'}}>
          <SaveButtons
            isSaving={this.props.isSaving}
            isChanged={this.props.isChanged}
            onSave={this.props.onSave}
            onReset={this.props.onCancel} />
        </div>
        <div className="form-horizontal">
          <Input
            type="text"
            label="Repository"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            value={this.props.data.get('repository', '')}
            onChange={this.onChangeRepository}
            help="GitHub or Bitbucket repository URL"
            placeholder="https://github.com/keboola/my-r-app"
          />

          <Input
            type="text"
            label="Version"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            value={this.props.data.get('version', '')}
            onChange={this.onChangeVersion}
            help={(
              <span>
                Branch or tag in the repository. Using <code>master</code> as a version is inefficient and should not be used in a production setup.
                {' '}We recommend using <ExternalLink href="http://semver.org/">Semantic versioning</ExternalLink>.
              </span>
            )}
            placeholder="1.0.0"
          />

          <Input
            type="checkbox"
            label="Allow application to access the Internet"
            wrapperClassName="col-xs-9 col-xs-offset-3"
            checked={this.props.data.get('network', 'bridge') === 'bridge'}
            onChange={this.onChangeNetwork}
            help="Preventing access to the Internet may cause the application to fail. Please consult with the application author(s)."
          />

          <Input
            type="text"
            label="Username"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            value={this.props.data.get('username', '')}
            onChange={this.onChangeUsername}
            help="Username and password are required only for private repositories"
            placeholder=""
          />

          <Input
            type="password"
            label="Password"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            value={this.props.data.get('#password', '')}
            onChange={this.onChangePassword}
            help="Password will be kept encrypted"
          />

        </div>
      </div>
    );
  }
});
