import React, {PropTypes} from 'react';
import {fromJS} from 'immutable';
import callDockerAction from '../../modules/components/DockerActionsApi';
import {Check} from '@keboola/indigo-ui';
import {Input, FormControls} from './KbcBootstrap';
import {Protected} from '@keboola/indigo-ui';
import Clipboard from './Clipboard';
import {Loader, ExternalLink} from '@keboola/indigo-ui';
const StaticText = FormControls.Static;


export default React.createClass({
  propTypes: {
    onChange: PropTypes.func,
    data: PropTypes.object,
    isEditing: PropTypes.bool,
    disabledCheckbox: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isGenerating: false,
      isKeygenError: false
    };
  },

  render() {
    return (
      <div>
        {this.renderEnableCheckbox()}
        {this.isEnabled() ?
          <span>
            {this.createInput('SSH host', 'sshHost', 'text', false)}
            {this.createInput('SSH user', 'user', 'text', false)}
            {this.createInput('SSH port', 'sshPort', 'number', false)}
            {this.renderPublicKey()}
          </span>
          : null
        }
      </div>
    );
  },

  isEnabled() {
    return this.props.data.get('enabled', false);
  },

  renderEnableCheckbox() {
    if (this.props.isEditing) {
      return (
        <Input
          disabled={!this.props.isEditing || this.props.disabledCheckbox}
          type="checkbox"
          label={<span>SSH Tunnel {this.renderHelp()}</span>}
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.isEnabled()}
          onChange={() => this.props.onChange(this.props.data.set('enabled', !this.isEnabled()))}
        />
      );
    } else {
      return (
        <StaticText
          label={<span>SSH Tunnel <small>{this.renderHelp()}</small></span>}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          <Check isChecked={this.isEnabled()} />
        </StaticText>
      );
    }
  },

  renderHelp() {
    return (
      <span>
        <ExternalLink href="https://help.keboola.com/extractors/database/#connecting-to-database">
          Help
        </ExternalLink>
      </span>
    );
  },

  renderPublicKey() {
    const publicKey = this.props.data.getIn(['keys', 'public']);
    return (
      <div className="form-group">
        <label className="control-label col-sm-4">
          SSH Public Key
        </label>
        <div className="col-sm-8">
          {(publicKey ?
            <pre>
              {publicKey}
              {this.renderClipboard(publicKey)}
            </pre> : null
          )}
          {(this.props.isEditing ? this.renderKeyGen(publicKey) : null)}
        </div>
      </div>
    );
  },

  renderKeyGen(publicKey) {
    return (
      <span>
        <button
          type="button"
          disabled={this.state.isGenerating}
          onClick={this.generateKeys}
          style={{'paddingLeft': 0}}
          className="btn btn-link">
          {publicKey ? 'Regenerate' : 'Generate'}
        </button>
        {this.state.isGenerating ? <Loader /> : null}
        {(this.state.isKeygenError ?
          <span className="text-danger">
            <span className="fa fa-fw fa-meh-o" />
              Unable to Generate SSH keys. Try it again.
          </span> : null
        )}
      </span>
    );
  },

  generateKeys() {
    this.setState({
      isKeygenError: false,
      isGenerating: true
    });

    callDockerAction('keboola.ssh-keygen-v2', 'generate', {configData: []}).then((result) => {
      if (result.status === 'success' || result.status === 'ok') {
        const newKeys = {
          'public': result.public,
          '#private': result.private
        };
        this.props.onChange(this.props.data.setIn(['keys'], fromJS(newKeys)));
      } else {
        this.setState({isKeygenError: true});
      }

      this.setState({
        isGenerating: false
      });
    });
  },

  handleChange(propName, event) {
    const value = event.target.value;
    this.props.onChange(this.props.data.setIn([].concat(propName), value));
  },

  createInput(labelValue, propName, type = 'text', isProtected = false) {
    const value = this.props.data.get(propName);
    if (this.props.isEditing) {
      return (
        <Input
          label={labelValue}
          type={type}
          value={this.props.data.get(propName)}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          onChange={this.handleChange.bind(this, propName)} />);
    } else if (isProtected) {
      return (
        <StaticText
          label={labelValue}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          <Protected>
            {this.props.data.get(propName)}
          </Protected>
          {this.renderClipboard(value)}
        </StaticText>);
    } else {
      return (
        <StaticText
          label={labelValue}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          {this.props.data.get(propName)}
          {this.renderClipboard(value)}
        </StaticText>);
    }
  },

  renderClipboard(value) {
    if (value) {
      return (<Clipboard text={value} />);
    } else {
      return null;
    }
  }
});
