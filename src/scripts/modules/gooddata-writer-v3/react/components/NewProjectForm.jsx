import React, {PropTypes} from 'react';
import {Form, Col, FormControl, ControlLabel, FormGroup, Radio, HelpBlock} from 'react-bootstrap';
import ReactSelect from 'react-select';
import {TokenTypes} from '../../provisioning/utils';

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
      <Form horizontal>
        <FormGroup>
          <Col sm={12}>
            <ReactSelect
              searchable={false}
              clearable={false}
              disabled={disabled}
              value={value.isCreateNewProject}
              onChange={(selected) => this.handleChange({isCreateNewProject: selected.value})}
              options={[
                {label: 'Create new GoodData Project', value: true},
                {label: 'Use Existing GoodData Project', value: false}
              ]}
            />
          </Col>
        </FormGroup>
        {value.isCreateNewProject ?
         this.renderNewProjectGroup() :
         this.renderExistingProjectGroup()
        }
      </Form>
    );
  },

  renderExistingProjectGroup() {
    return [
      this.renderInputControlGroup('Project Id', 'pid'),
      this.renderInputControlGroup('Username', 'login'),
      this.renderInputControlGroup('Password', 'password')
    ];
  },

  renderInputControlGroup(label, fieldName) {
    const {disabled, value} = this.props;
    return (
      <FormGroup key={fieldName}>
        <Col sm={3} componentClass={ControlLabel}>
          {label}
        </Col>
        <Col sm={9}>
          <FormControl
            type={fieldName === 'password' ? 'password' : 'text'}
            disabled={disabled}
            onChange={e => this.handleChange({[fieldName]: e.target.value})}
            value={value[fieldName]}
          />
        </Col>
      </FormGroup>

    );
  },

  renderNewProjectGroup() {
    const {disabled, value} = this.props;
    const {tokenType} = value;
    return [
      this.renderInputControlGroup('Project Name', 'name'),
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
              disabled={this.props.canCreateProdProject || disabled}
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
             value={value.customToken}
           />
          }
        </Col>
      </FormGroup>
    ];
  }
});
