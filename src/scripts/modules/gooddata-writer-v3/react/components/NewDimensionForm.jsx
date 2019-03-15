import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Radio, HelpBlock, Form, Col, Checkbox, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {PanelWithDetails} from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired
  },

  handleChange(newDiff) {
    this.props.onChange({...this.props.value, ...newDiff});
  },

  render() {
    const {disabled, value} = this.props;

    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Name</Col>
          <Col sm={9}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => this.handleChange({name: e.target.value})}
              value={value.name}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Checkbox
              checked={value.includeTime}
              onChange={() => this.handleChange({includeTime: !value.includeTime})}>
              Include Time
            </Checkbox>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Template</Col>
          <Col sm={9}>
            {this.renderRadio('GoodData', 'gooddata', 'Default date dimension provided by GoodData')}
            {this.renderRadio('Keboola', 'keboola', 'Default date dimension provided by Keboola. Added all week setups: Mon-Sun, Tue-Mon, Wed-Tue, Thu-Wed, Fri-Thu, Sat-Fri, Sun-Sat + Boolean value whether its weekend or working day')}
            {this.renderRadio('Custom', 'custom', 'Provide your own template. You can generate the csv file containing all necessary details and provide it to GoodData.')}
          </Col>
        </FormGroup>
        {value.template !== 'keboola' && value.template !== 'gooddata' && (
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>Template ID</Col>
            <Col sm={9}>
              <FormControl
                type="text"
                disabled={disabled}
                onChange={e => this.handleChange({templateId: e.target.value})}
                value={value.templateId}
              />
            </Col>
          </FormGroup>
        )}
        <PanelWithDetails
          defaultExpanded={false}
          labelCollapse="Hide Advanced Options"
          labelOpen="Show Advanced Options"
          placement="top"
        >
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>Identifier</Col>
            <Col sm={9}>
              <FormControl
                type="text"
                placeholder="optional"
                disabled={disabled}
                onChange={e => this.handleChange({identifier: e.target.value})}
                value={value.identifier}
              />
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </Form>
    );
  },

  renderRadio(label, value, helpText) {
    return (
      <div>
        <Radio
          disabled={this.props.disabled}
          checked={this.props.value.template === value}
          onChange={() => this.handleChange({template: value})}
          value={value} name="template"
        >
          {label}
        </Radio>
        {helpText && <HelpBlock>{helpText}</HelpBlock>}
      </div>
    );
  }
});
