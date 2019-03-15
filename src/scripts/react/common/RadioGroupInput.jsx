import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormGroup, HelpBlock } from 'react-bootstrap';
import {Radio} from 'react-radio-group';

const RadioGroupInput = (props) => {
  return (
    <FormGroup>
      <div className={props.wrapperClassName}>
        <div className="radio">
          <label title={props.label}>
            <Radio value={props.value} />
            <span>{props.label}</span>
          </label>
        </div>
        {props.help && <HelpBlock>{props.help}</HelpBlock>}
      </div>
    </FormGroup>
  );
};

RadioGroupInput.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  help: PropTypes.node,
  wrapperClassName: PropTypes.string
};

export default RadioGroupInput;
