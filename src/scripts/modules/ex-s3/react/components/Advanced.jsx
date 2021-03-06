import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { Col, FormControl, FormGroup, HelpBlock, ControlLabel} from 'react-bootstrap';
import CsvDelimiterInput from './../../../../react/common/CsvDelimiterInput';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    delimiter: PropTypes.string.isRequired,
    enclosure: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  onChangeDelimiter(value) {
    this.props.onChange('delimiter', value);
  },

  onChangeEnclosure(e) {
    this.props.onChange('enclosure', e.target.value);
  },

  render() {
    return (
      <div className="form-horizontal">
        <CsvDelimiterInput
          label="Delimiter"
          value={this.props.delimiter}
          onChange={this.onChangeDelimiter}
          help={(<span>Field delimiter used in the CSV file. The default value is <code>,</code>. Use <code>\t</code> for tabulator.</span>)}
          disabled={this.props.disabled}
        />
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Enclosure</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.enclosure}
              onChange={this.onChangeEnclosure}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Field enclosure used in the CSV file. The default value is <code>&quot;</code>.
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  }
});
