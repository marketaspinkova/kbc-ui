import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Input } from './../../../../react/common/KbcBootstrap';
import Select from '../../../../react/common/Select';
import Immutable from 'immutable';
import { ControlLabel, FormGroup } from 'react-bootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.shape({
      type: PropTypes.string.isRequired,
      email: PropTypes.string,
      schemas_read: PropTypes.array,
      schemas_write: PropTypes.array,
      business_schemas: PropTypes.array,
      disabled: PropTypes.bool,
      schema_name: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  allowedTypes: Immutable.fromJS([
    { value: 'schema', label: 'Schema' },
    { value: 'user', label: 'User' }
  ]),

  render() {
    const { onChange, value } = this.props;
    let notUsedSchemas = [];
    if (value.type === 'user') {
      notUsedSchemas = this.filterUsedSchemasFromExisting(
        value.existingSchemas,
        value.schemas_read,
        value.schemas_write
      );
    }
    return (
      <div className="form-horizontal">
        <h2>Entity</h2>
        <Input
          type="select"
          label="Type"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={value.type}
          onChange={(e) => onChange({ type: e.target.value })}
          disabled={this.props.disabled}
          help={
            value.type === 'user' ? (
              <p>
                User entity gets its own write access schema as well as read-only access to
                specified schemas (created by schema entity). Snowflake user credentials will be
                displayed in the job log and the password must be changed after the first login.
              </p>
            ) : (
              <p>
                Schema entity will generate a Snowflake schema and a Snowflake user with write
                access to the schema. This schema can be shared with user entities. Snowflake user
                credentials will be displayed in the job log and the password must be changed after
                the first login.
              </p>
            )
          }
        >
          {this.allowedTypes.map((i) => (
            <option value={i.get('value')} key={i.get('value')}>
              {i.get('label')}
            </option>
          ))}
        </Input>
        <h2>{value.type === 'user' ? 'User' : 'Schema'}</h2>
        {value.type === 'schema' && (
          <Input
            type="text"
            label="Name"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            value={value.schema_name}
            onChange={(e) => onChange({ schema_name: e.target.value })}
            disabled={this.props.disabled}
            help="Name of the schema to be created."
          />
        )}
        {value.type === 'user' && (
          <Input
            type="text"
            label="Email"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            disabled={this.props.disabled}
            help="Username will be generated from the email address."
          />
        )}
        {value.type === 'user' && (
          <div>
            <FormGroup>
              <ControlLabel className="col-xs-4">Read schemas</ControlLabel>
              <div className="col-xs-8">
                <Select
                  multi
                  value={value.schemas_read}
                  delimiter=","
                  options={notUsedSchemas}
                  onChange={(newValue) => onChange({ schemas_read: newValue })}
                  disabled={this.props.disabled}
                  help="List of schemas the user will have read-only access to. There is no validation yet, so make sure that there are no typos and schemas exist before creating the user."
                />
              </div>
            </FormGroup>
            <FormGroup>
              <ControlLabel className="col-xs-4">Write schemas</ControlLabel>
              <div className="col-xs-8">
                <Select
                  multi
                  value={value.schemas_write}
                  delimiter=","
                  options={notUsedSchemas}
                  onChange={(newValue) => onChange({ schemas_write: newValue })}
                  disabled={this.props.disabled}
                  help="List of schemas the user will have read and write access to. There is no validation yet, so make sure that there are no typos and schemas exist before creating the user."
                />
              </div>
            </FormGroup>
          </div>
        )}
        {value.type === 'user' && (
          <Input
            type="checkbox"
            label="Disabled"
            wrapperClassName="col-xs-8 col-xs-offset-4"
            checked={value.disabled}
            onChange={(e) => onChange({ disabled: e.target.checked })}
            disabled={this.props.disabled}
            help="Disabled users cannot log in."
          />
        )}
      </div>
    );
  },
  filterUsedSchemasFromExisting(existing, schemasRead, schemasWrite) {
    return existing.filter((item) => {
      return !(schemasRead.includes(item.value) || schemasWrite.includes(item.value));
    });
  }
});
