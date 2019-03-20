import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {RadioGroup} from 'react-radio-group';
import { ControlLabel, HelpBlock, FormControl, FormGroup, Col } from 'react-bootstrap';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';

export default createReactClass({
  propTypes: {
    onChangeSheetTitle: PropTypes.func.isRequired,
    onChangeAction: PropTypes.func.isRequired,
    valueSheetTitle: PropTypes.string.isRequired,
    valueAction: PropTypes.string.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        {this.renderSheetTitle()}
        {this.renderActionRadio()}
      </div>
    );
  },

  renderSheetTitle() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>Sheet title</Col>
        <Col md={10}>
          <FormControl
            placeholder="Sheet1"
            type="text"
            value={this.props.valueSheetTitle}
            onChange={this.props.onChangeSheetTitle}
          />
          <HelpBlock>
            Type the name of an existing sheet to import into it, or type a unique name to add a new sheet into the spreadsheet.
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderActionRadio() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          Action
        </label>
        <div className="col-md-10">
          <RadioGroup
            name="Action"
            selectedValue={this.props.valueAction}
            onChange={this.props.onChangeAction}
          >
            <div className="form-horizontal">
              <RadioGroupInput
                label="Update rows"
                help="Overwrites data in the sheet"
                wrapperClassName="col-sm-8"
                value="update"
              />
              <RadioGroupInput
                label="Append rows"
                help="Add new data to the end of the sheet"
                wrapperClassName="col-sm-8"
                value="append"
              />
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  }
});
