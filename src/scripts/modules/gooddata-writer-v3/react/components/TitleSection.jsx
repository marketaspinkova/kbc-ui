import PropTypes from 'prop-types';
import React from 'react';
import {FormControl, FormGroup, ControlLabel, Form, Col, HelpBlock} from 'react-bootstrap';
import StorageApiLink from '../../../components/react/components/StorageApiTableLinkEx';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      title: PropTypes.string,
      identifier: PropTypes.string
    }),
    tableId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Storage Table
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              <StorageApiLink
                tableId={this.props.tableId}
              >
                {this.props.tableId}
              </StorageApiLink>
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Title</Col>
          <Col sm={8}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => onChange({title: e.target.value})}
              value={value.title}
            />
            <HelpBlock>Pretty name of the dataset in GoodData</HelpBlock>
          </Col>

        </FormGroup>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>Identifier</Col>
          <Col sm={8}>
            <FormControl
              type="text"
              disabled={disabled}
              onChange={e => onChange({identifier: e.target.value})}
              value={value.identifier}
            />
            <HelpBlock>Custom identifier of the dataset in GoodData(optional).</HelpBlock>
          </Col>

        </FormGroup>
      </Form>
    );
  }
});
