import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ControlLabel, HelpBlock, FormControl, FormGroup, Col, Radio } from 'react-bootstrap';

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
      <FormGroup>
        <Col md={2} componentClass={ControlLabel}>
          Action
        </Col>
        <Col md={10}>
          <FormGroup>
            <Radio
              value="update"
              checked={this.props.valueAction === 'update'}
              onChange={(event) => this.props.onChangeAction(event.target.value)}
            >
              Update rows
            </Radio>
            <HelpBlock>
              Overwrites data in the sheet
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <Radio
              value="append"
              checked={this.props.valueAction === 'append'}
              onChange={(event) => this.props.onChangeAction(event.target.value)}
            >
              Append rows
            </Radio>
            <HelpBlock>
              Add new data to the end of the sheet
            </HelpBlock>
          </FormGroup>
        </Col>
      </FormGroup>
    );
  }
});
