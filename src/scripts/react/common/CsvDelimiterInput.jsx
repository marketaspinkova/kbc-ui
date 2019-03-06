import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Input} from './../../react/common/KbcBootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  displayName: 'CsvDelimiterInput',

  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    label: PropTypes.node,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    help: PropTypes.node
  },

  getDefaultProps() {
    return {
      label: 'Delimiter',
      labelClassName: 'col-xs-4',
      wrapperClassName: 'col-xs-8',
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
      <Input
        type="text"
        label={this.props.label}
        labelClassName={this.props.labelClassName}
        wrapperClassName={this.props.wrapperClassName}
        value={this.getValue()}
        onChange={this.onChange}
        help={this.props.help}
        disabled={this.props.disabled}
      />
    );
  }
});
