import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormGroup, ControlLabel, Col, HelpBlock, Checkbox} from 'react-bootstrap';
import Select from '../../../../react/common/Select';
import {Input} from "../../../../react/common/KbcBootstrap";


export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      tableName: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired,
      primaryKey: PropTypes.array.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  onDestinationEdit() {
    const value = this.props.value;
    this.props.onChange(value);
  },

  render() {
    const props = this.props;

    return (
      <Form horizontal>
        <h3>Save Settings</h3>
        <Input
          type="text"
          label="Storage Table Name"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-8"
          value={props.value.tableName}
          onChange={function(e) {
            props.onChange({tableName: e.target.value});
          }}
          placeholder="mytable"
          disabled={props.disabled}
          help={(<span>Name of the table stored in Storage.</span>)}
        />
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={props.value.incremental}
              disabled={props.disabled}
              onChange={function(e) {
                props.onChange({incremental: e.target.checked});
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
              value={props.value.primaryKey}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder="Add a column to the primary key"
              emptyStrings={false}
              onChange={function(value) {
                props.onChange({primaryKey: value});
              }}
              disabled={props.disabled}
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
