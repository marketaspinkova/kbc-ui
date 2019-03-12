import React, {PropTypes} from 'react';
import {Col, FormControl, ControlLabel, FormGroup, Radio, HelpBlock, Button, ButtonGroup} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import {TokenTypes} from '../../gooddataProvisioning/utils';

export default React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
    canCreateProdProject: PropTypes.bool.isRequired
  },

  handleChange(newDiff) {
    this.props.onChange({...this.props.value, ...newDiff});
  },

  render() {
    const {disabled, value} = this.props;

    return (
      <div>
        <FormGroup>
          <Col sm={12}>
            <ButtonGroup justified>
              <Button
                componentClass="span"
                disabled={disabled}
                active={value.isCreateNewProject}
                onClick={() => this.handleChange({isCreateNewProject: true})}>
                Create new GoodData Project
              </Button>
              <Button
                componentClass="span"
                disabled={disabled}
                active={!value.isCreateNewProject}
                onClick={() => this.handleChange({isCreateNewProject: false})}>
                Use Existing GoodData Project
              </Button>
            </ButtonGroup>
          </Col>
        </FormGroup>
        {value.isCreateNewProject ?
          this.renderNewProjectGroup() :
          this.renderExistingProjectGroup()
        }
      </div>
    );
  },

  renderExistingProjectGroup() {
    return [
      this.renderInputControlGroup('Project Id', 'pid', 'type pid', 'Id of GoodData project'),
      this.renderInputControlGroup('Username', 'login', 'type username', 'Username of GoodData user'),
      this.renderInputControlGroup('Password', 'password', 'type password', 'Password of GoodData user')
    ];
  },

  renderInputControlGroup(label, fieldName, placeholder, help) {
    const {disabled, value} = this.props;
    return (
      <FormGroup key={fieldName}>
        <Col sm={3} componentClass={ControlLabel}>
          {label}
        </Col>
        <Col sm={9}>
          <FormControl
            helpBlock={help}
            placeholder={placeholder}
            type={fieldName === 'password' ? 'password' : 'text'}
            disabled={disabled}
            onChange={e => this.handleChange({[fieldName]: e.target.value})}
            value={value[fieldName]}
          />
          {help && <HelpBlock>{help}</HelpBlock>}
        </Col>
      </FormGroup>

    );
  },

  renderNewProjectGroup() {
    const {disabled, value: {tokenType, customToken}} = this.props;
    return [
      this.renderInputControlGroup('Project Name', 'name', 'name of GoodData project'),
      <FormGroup key="authToken">
        <Col componentClass={ControlLabel} sm={3}>Auth Token</Col>
        <Col sm={9}>
          <div>
            <Radio
              disabled={disabled}
              value={TokenTypes.DEMO}
              checked={tokenType === TokenTypes.DEMO}
              onChange={e => this.handleChange({tokenType: e.target.value})}
              name="authtokengroup">
              Demo
            </Radio>
            <HelpBlock>max 1GB of data, expires in 1 month</HelpBlock>
          </div>
          <div>
            <Radio
              disabled={!this.props.canCreateProdProject || disabled}
              value={TokenTypes.PRODUCTION}
              onChange={e => this.handleChange({tokenType: e.target.value})}
              checked={tokenType === TokenTypes.PRODUCTION}
              name="authtokengroup">
              Production
            </Radio>
            <HelpBlock>You are paying for it. Please contact support to enable production project.</HelpBlock>
          </div>
          <div>
            <Radio
              disabled={disabled}
              value={TokenTypes.CUSTOM}
              checked={tokenType === TokenTypes.CUSTOM}
              onChange={e => this.handleChange({tokenType: e.target.value})}
              name="authtokengroup">
              Custom
            </Radio>
            <HelpBlock>You have your own token</HelpBlock>
          </div>
          {tokenType === TokenTypes.CUSTOM &&
           <FormControl
             type="text"
             disabled={disabled}
             onChange={e => this.handleChange({customToken: e.target.value})}
             value={customToken}
           />
          }
        </Col>
      </FormGroup>,
      <p key="terms">
        By creating a project, you agree with the{' '}
        <ExternalLink href="https://www.gooddata.com/terms-of-use">GoodData terms and conditions</ExternalLink>.
      </p>
    ];
  }
});
