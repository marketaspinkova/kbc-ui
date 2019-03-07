import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { FormGroup, FormControl, ControlLabel, Col, HelpBlock } from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      host: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
      database: PropTypes.string.isRequired,
      warehouse: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {onChange, value} = this.props;
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Host</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={value.host}
              onChange={e => onChange({host: e.target.value})}
              placeholder="example.snowflakecomputing.com"
              disabled={this.props.disabled}
            />
            <HelpBlock>Snowflake instance hostname</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>User</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={value.user}
              onChange={e => onChange({user: e.target.value})}
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Password</Col>
          <Col xs={8}>
            <FormControl
              type="password"
              value={value.password}
              onChange={e => onChange({password: e.target.value})}
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Database</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={value.database}
              onChange={e => onChange({database: e.target.value})}
              disabled={this.props.disabled}
            />
            <HelpBlock>You need to have privileges to create new schemas in this database</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Warehouse</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={value.warehouse}
              onChange={e => onChange({warehouse: e.target.value})}
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }
});
