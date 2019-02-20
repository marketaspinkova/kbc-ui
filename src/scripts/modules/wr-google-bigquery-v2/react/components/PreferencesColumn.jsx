import React, {PropTypes} from 'react';
import {FormControl, Form, FormGroup, Col, ControlLabel} from 'react-bootstrap';
import makeColumnDefinition from '../../helpers/makeColumnDefinition';
import {Types} from '../../helpers/constants';

export default React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    column: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired,
    showAdvanced: PropTypes.bool
  },

  renderDbName() {
    return (
      <FormGroup className="col-sm-12">
        <Col sm={4} componentClass={ControlLabel}>
          BigQuery Column
        </Col>
        <Col sm={8}>
          <FormControl
            type="text"
            disabled={this.props.disabled}
            onChange={e => this.onChangeColumn('dbName', e.target.value)}
            value={this.props.column.dbName}
          />
        </Col>
      </FormGroup>
    );
  },

  render() {
    const {fields} = makeColumnDefinition(this.props.column);
    return (
      <Form horizontal>
        <FormGroup className="col-sm-12">
          <Col sm={4} componentClass={ControlLabel}>
            Data Type
          </Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              type="select"
              autosize={false}
              clearable={false}
              value={this.props.column.type}
              onChange={e => this.onChangeColumn('type', e.target.value)}
              disabled={this.props.disabled}>
              {Object.keys(Types).map(option => <option value={option} key={option}>{option}</option>)}
            </FormControl>

          </Col>
        </FormGroup>
        {fields.dbName.show && this.renderDbName()}
      </Form>
    );
  },

  onChangeColumn(property, value) {
    const newColumn = makeColumnDefinition(this.props.column)
      .updateColumn(property, value)
      .column;
    this.props.onChange(newColumn);
  }
});
