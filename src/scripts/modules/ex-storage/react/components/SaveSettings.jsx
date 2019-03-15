import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormGroup, ControlLabel, Col, HelpBlock, Checkbox} from 'react-bootstrap';
import Select from '../../../../react/common/Select';


export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      incremental: PropTypes.bool.isRequired,
      primaryKey: PropTypes.array.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Form horizontal>
        <h3>Save Settings</h3>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.incremental}
              onChange={(e) => {
                this.props.onChange({incremental: e.target.checked});
              }}
            >Incremental</Checkbox>
            <HelpBlock>
              If incremental load is turned on, table will be updated instead of rewritten. Tables with primary key will update rows, tables without primary key will append rows.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Primary Key
          </Col>
          <Col sm={8}>
            <Select
              name="primaryKey"
              value={this.props.value.primaryKey}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder="Add a column to the primary key"
              emptyStrings={false}
              onChange={(value) => {
                this.props.onChange({primaryKey: value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              If primary key is set, updates can be done on table by selecting <strong>incremental loads</strong>. Primary key can consist of multiple columns. Primary key of an existing table cannot be changed.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
