import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { FormControl, FormGroup, Col, HelpBlock, ControlLabel } from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  displayName: 'CsvDelimiterInput',

  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    label: PropTypes.node,
    help: PropTypes.node
  },

  getDefaultProps() {
    return {
      label: 'Delimiter',
      help: (<span>Field delimiter used in CSV file. Default value is <code>,</code>. Use <code>\t</code> for tabulator.</span>)
    };
  },

  onChange(e) {
    this.props.onChange(e.target.value.replace('\\t', '\t'));
  },

  getValue() {
    return this.props.value.replace('\t', '\\t');
  },

  render() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} xs={4}>{this.props.label}</Col>
        <Col xs={8}>
          <FormControl
            type="text"
            value={this.getValue()}
            onChange={this.onChange}
            disabled={this.props.disabled}
          />
          <HelpBlock>{this.props.help}</HelpBlock>
        </Col>
      </FormGroup>
    );
  }
});
