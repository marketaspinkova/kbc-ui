import React, {PropTypes} from 'react';
import {fromJS} from 'immutable';
import callDockerAction from '../../modules/components/DockerActionsApi';
import { Checkbox, Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import Clipboard from './Clipboard';
import {Loader, ExternalLink} from '@keboola/indigo-ui';

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
    return (
      <FormGroup>
        <Col xs={8} xsOffset={4}>
          <Checkbox
            disabled={!this.props.isEditing || this.props.disabledCheckbox}
            checked={this.isEnabled()}
            onChange={() => this.props.onChange(this.props.data.set('enabled', !this.isEnabled()))}
          >
            SSH Tunnel {this.renderHelp()}
          </Checkbox>
        </Col>
      </FormGroup>
    );
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

  createInput(labelValue, propName, type = 'text') {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} xs={4}>{labelValue}</Col>
        <Col xs={8}>
          <FormControl
            type={type}
            disabled={!this.props.isEditing}
            value={this.props.data.get(propName)}
            onChange={this.handleChange.bind(this, propName)}
          />
        </Col>
      </FormGroup>
    );
  },

  renderClipboard(value) {
    if (value) {
      return (<Clipboard text={value} />);
    } else {
      return null;
    }
  }
});
