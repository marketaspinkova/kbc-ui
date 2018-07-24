import React, {PropTypes} from 'react';
import {Form, Col, FormControl, ControlLabel, FormGroup, Radio, HelpBlock} from 'react-bootstrap';
import ReactSelect from 'react-select';
import {ActionTypes, TokenTypes} from '../../provisioning/utils';

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
              clearable={false}
              disabled={disabled}
              value={value.action}
              onChange={(selected) => this.handleChange({action: selected.value})}
              options={[
                {label: 'Create new GoodData Project', value: ActionTypes.CREATE},
                {label: 'Use Existing GoodData Project', value: ActionTypes.USE_EXISTING}
              ]}
            />
          </Col>
        </FormGroup>
        {value.action === ActionTypes.CREATE ?
         this.renderAuthTokenGroup() :
         this.renderExistingProjectGroup()
        }
      </Form>
    );
  },

  renderExistingProjectGroup() {
    return [
      this.renderInputControlGroup('Username', 'login'),
      this.renderInputControlGroup('Password', 'password'),
      this.renderInputControlGroup('Project Id', 'pid')
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
            type="text"
            disabled={disabled}
            onChange={e => this.handleChange({[fieldName]: e.target.value})}
            value={value[fieldName]}
          />
        </Col>
      </FormGroup>

    );
  },

  renderAuthTokenGroup() {
    const {disabled, value} = this.props;
    const {tokenType} = value;
    return (
      <FormGroup>
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
    );
  }
});
