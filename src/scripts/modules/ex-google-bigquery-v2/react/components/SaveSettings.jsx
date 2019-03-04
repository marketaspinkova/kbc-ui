import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormGroup, ControlLabel, Col, HelpBlock, Checkbox} from 'react-bootstrap';
import Select from '../../../../react/common/Select';
import TableSelectorForm from '../../../../react/common/TableSelectorForm';


export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      outputTable: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired,
      primaryKey: PropTypes.array.isRequired,
      destinationEditing: PropTypes.bool.isRequired,
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
        <TableSelectorForm
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-8"
          value={this.props.value.outputTable}
          onChange={function(value) {
            props.onChange({outputTable: value});
          }}
          disabled={this.props.disabled}
          label="Destination"
          help="Where the table will be imported.
                  If the table or bucket does not exist, it will be created."
          onEdit={() => this.onDestinationEdit()}
          editing={this.props.value.destinationEditing}
        />
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.incremental}
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
              value={this.props.value.primaryKey}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder="Add a column to the primary key"
              emptyStrings={false}
              onChange={function(value) {
                props.onChange({primaryKey: value});
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
