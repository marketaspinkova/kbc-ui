import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { trim } from 'underscore.string';
import { FormGroup, FormControl, HelpBlock, Col, ControlLabel } from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      baseUrl: PropTypes.string.isRequired,
      maxRedirects: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Base URL</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.baseUrl}
              onChange={e => {
                this.props.onChange({ baseUrl: trim(e.target.value) });
              }}
              placeholder="https://example.com"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Base URL is common for all files downloaded from a certain site/domain.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Maximum Redirects</Col>
          <Col xs={8}>
            <FormControl
              type="number"
              min="0"
              value={this.props.value.maxRedirects}
              onChange={e => {
                this.props.onChange({ maxRedirects: e.target.value });
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              The maximum number of redirects to follow when downloading files. Leave empty to use default value (5).
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  }
});
