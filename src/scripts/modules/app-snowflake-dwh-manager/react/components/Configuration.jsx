import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Input} from './../../../../react/common/KbcBootstrap';
import Select from '../../../../react/common/Select';
import {Immutable} from '../../../../helpers';
import {ControlLabel, FormGroup} from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      type: PropTypes.string.isRequired,
      email: PropTypes.string,
      business_schemas: PropTypes.array,
      disabled: PropTypes.bool,
      schema_name: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  allowedTypes: Immutable.fromJS([
    {value: 'schema', label: 'Schema'},
    {value: 'user', label: 'User'}
  ]),

  render() {
    const {onChange, value} = this.props;
    return (
      <div className="form-horizontal">
        <h2>{(value.type === 'user' ? 'User' : 'Schema')}</h2>
        {value.type === 'user' ?
          <p>
            User gets their own full access schema as well as read-only access to other specified schemas. Credentials of newly created user will be displayed in the job log. User is required to change the generated password after first login.
          </p>
          :
          <p>
           Each schema is assigned a user with full access to use in Snowflake Writer. The credentials will be displayed in the job log.
          </p>}
        <Input
          type="select"
          label="Row type"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={value.type}
          onChange={e => onChange({type: e.target.value})}
          disabled={this.props.disabled}>
          {this.allowedTypes.map((i) =>
            <option
              value={i.get('value')}
              key={i.get('value')}
            >
              {i.get('label')}
            </option>
          )}
        </Input>
        {value.type === 'schema' &&
      <Input
        type="text"
        label="Schema name"
        labelClassName="col-xs-4"
        wrapperClassName="col-xs-8"
        value={value.schema_name}
        onChange={e => onChange({schema_name: e.target.value})}
        disabled={this.props.disabled}
        help="Name of the schema to be created" />}
        {value.type === 'user' &&
        <Input
          type="text"
          label="Email"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={value.email}
          onChange={e => onChange({email: e.target.value})}
          disabled={this.props.disabled}
          help="Email address to log in to Snowflake. Password will be displayed in the job log and user will be required to change it upon first login" />}
        {value.type === 'user' &&
        <FormGroup> <ControlLabel className="col-xs-4">
          {'Business schemas'}
        </ControlLabel>
          <div className="col-xs-8">
            <Select
              allowCreate={true}
              multi={true}
              value={value.business_schemas}
              delimiter=","
              onChange={newValue => onChange({business_schemas: newValue})}
              disabled={this.props.disabled}
              help="List of schemas the user will have read-only access to. There is no validation yet, so make sure that there are no typos and schemas exist before creating the user. " />
          </div>
        </FormGroup>}
        {value.type === 'user' &&
        <Input
          type="checkbox"
          label="Disabled"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          checked={value.disabled}
          onChange={e => onChange({disabled: e.target.checked})}
          disabled={this.props.disabled}
          help="Disabled users cannot log in" />}
      </div>
    );
  }
});
