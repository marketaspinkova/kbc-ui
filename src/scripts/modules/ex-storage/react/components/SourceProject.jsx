import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {FormControl, FormGroup, ControlLabel, HelpBlock, Form, Col} from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      url: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project Region
          </Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.props.value.url}
              onChange={function(e) {
                props.onChange({url: e.target.value});
              }}
              disabled={this.props.disabled}
            >
              <option value="" disabled>Select region</option>
              <option value="https://connection.ap-southeast-2.keboola.com/">AU (connection.ap-southeast-2.keboola.com)</option>
              <option value="https://connection.eu-central-1.keboola.com/">EU (connection.eu-central-1.keboola.com)</option>
              <option value="https://connection.keboola.com/">US (connection.keboola.com)</option>
            </FormControl>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Storage API Token
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.token}
              onChange={function(e) {
                props.onChange({token: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>Use a token with permissions limited only to read from a single bucket in the source project.</HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
