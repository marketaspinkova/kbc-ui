import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import { Col, FormGroup, Checkbox, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import PasswordControl from '../../../../react/common/PasswordControl';
import SaveButtons from '../../../../react/common/SaveButtons';

export default createReactClass({
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
        <HelpBlock>This information should be provided by the application developer.</HelpBlock>
        <div className="text-right" style={{padding: '1em 0'}}>
          <SaveButtons
            isSaving={this.props.isSaving}
            isChanged={this.props.isChanged}
            onSave={this.props.onSave}
            onReset={this.props.onCancel} />
        </div>
        <div className="form-horizontal">
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>
              Repository
            </Col>
            <Col xs={9}>
              <FormControl
                type="text"
                value={this.props.data.get('repository', '')}
                onChange={this.onChangeRepository}
                placeholder="https://github.com/keboola/my-r-app"
              />
              <HelpBlock>
                GitHub or Bitbucket repository URL
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>
              Version
            </Col>
            <Col xs={9}>
              <FormControl
                type="text"
                value={this.props.data.get('version', '')}
                onChange={this.onChangeVersion}
                placeholder="1.0.0"
              />
              <HelpBlock>
                <span>
                  Branch or tag in the repository. Using <code>master</code> as a version is inefficient and should not be used in a production setup.
                  {' '}We recommend using <ExternalLink href="http://semver.org/">Semantic versioning</ExternalLink>.
                </span>
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={9} xsOffset={3}>
              <Checkbox
                checked={this.props.data.get('network', 'bridge') === 'bridge'}
                onChange={this.onChangeNetwork}
              >
                Allow application to access the Internet
              </Checkbox>
              <HelpBlock>
                Preventing access to the Internet may cause the application to fail. Please consult with the application author(s).
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>
              Username
            </Col>
            <Col xs={9}>
              <FormControl
                type="text"
                value={this.props.data.get('username', '')}
                onChange={this.onChangeUsername}
              />
              <HelpBlock>
                Username and password are required only for private repositories.
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>
              Password
            </Col>
            <Col xs={9}>
              <PasswordControl
                value={this.props.data.get('#password', '')}
                onChange={this.onChangePassword}
              />
              <HelpBlock>
                Password will be kept encrypted
              </HelpBlock>
            </Col>
          </FormGroup>
        </div>
      </div>
    );
  }
});
