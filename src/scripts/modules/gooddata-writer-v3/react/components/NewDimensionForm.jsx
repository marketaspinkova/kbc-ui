import React, {PropTypes} from 'react';
import {Form, Col, Checkbox, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import RadioGroup from 'react-radio-group';
import {Input} from '../../../../react/common/KbcBootstrap';

export default React.createClass({
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
          <Col sm={9} smPush={3}>
            <Checkbox
              checked={value.includeTime}
              onChange={() => this.handleChange({includeTime: !value.includeTime})}>
              Include time
            </Checkbox>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Identifier</Col>
          <Col sm={9}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => this.handleChange({identifier: e.target.value})}
              value={value.identifier}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Template</Col>
          <Col sm={9}>
            <RadioGroup
              disabled={this.props.disabled}
              name="template"
              value={value.template}
              onChange={(e) => this.handleChange({template: e.target.value})}
            >
              <Input
                type="radio"
                label="Gooddata "
                help="Default date dimension provided by GoodData"
                value="gooddata"
              />
              <Input
                type="radio"
                label="Keboola"
                help="Default date dimension provided by Keboola. Added all week setups: Mon-Sun, Tue-Mon, Wed-Tue, Thu-Wed, Fri-Thu, Sat0Fri, Sun-Sat + Boolean value whether its weekend or working day"
                value="keboola"
              />
              <Input
                type="radio"
                label="Custom"
                help="Provide your own template. You can generate the csv file containing all necessary details and provide it ti Goog Data. More info: TODO"
                value="custom"
              />
            </RadioGroup>
          </Col>
        </FormGroup>
        {value.template !== 'keboola' && value.template !== 'gooddata' &&
         <FormGroup>
           <Col componentClass={ControlLabel} sm={3}>Template ID</Col>
           <Col sm={9}>
             <FormControl
               type="text"
               disabled={disabled}
               onChange={e => this.handleChange({templateId: e.target.value})}
               value={value.template}
             />
           </Col>
         </FormGroup>
        }
      </Form>
    );
  }


});
