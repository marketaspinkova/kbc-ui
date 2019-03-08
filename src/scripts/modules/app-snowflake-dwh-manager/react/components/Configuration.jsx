import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Col, ControlLabel, FormControl, FormGroup, HelpBlock, Checkbox } from 'react-bootstrap';
import Select from '../../../../react/common/Select';
import Immutable from 'immutable';

export default React.createClass({
  mixins: [immutableMixin],

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
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Type</Col>
          <Col xs={8}>
            <FormControl
              componentClass="select"
              value={value.type}
              onChange={(e) => onChange({type: e.target.value})}
              disabled={this.props.disabled}
            >
              {this.allowedTypes.map((i) => (
                <option value={i.get('value')} key={i.get('value')}>
                  {i.get('label')}
                </option>
              ))}
            </FormControl>
            <HelpBlock>
              {
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
            </HelpBlock>
          </Col>
        </FormGroup>
        <h2>{value.type === 'user' ? 'User' : 'Schema'}</h2>
        {value.type === 'schema' && (
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>Name</Col>
            <Col xs={8}>
              <FormControl
                type="text"
                value={value.schema_name}
                onChange={(e) => onChange({schema_name: e.target.value})}
                disabled={this.props.disabled}
              />
              <HelpBlock>Name of the schema to be created.</HelpBlock>
            </Col>
          </FormGroup>
        )}
        {value.type === 'user' && (
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>Email</Col>
            <Col xs={8}>
              <FormControl
                type="text"
                value={value.email}
                onChange={(e) => onChange({email: e.target.value})}
                disabled={this.props.disabled}
              />
              <HelpBlock>Username will be generated from the email address.</HelpBlock>
            </Col>
          </FormGroup>
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
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={value.disabled}
                onChange={(e) => onChange({ disabled: e.target.checked })}
                disabled={this.props.disabled}
              >
                Disabled
              </Checkbox>
              <HelpBlock>Disabled users cannot log in.</HelpBlock>
            </Col>
          </FormGroup>
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
