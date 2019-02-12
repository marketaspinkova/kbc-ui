import React from 'react';
import CodeMirror from 'react-code-mirror';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.string.isRequired,
    readOnly: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    mode: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      mode: 'text/x-mysql',
      placeholder: '',
      lineNumbers: true
    };
  },

  render() {
    return (
      <CodeMirror
        value={this.props.value}
        theme="solarized"
        lineNumbers={this.props.lineNumbers}
        mode={this.props.mode}
        placeholder={this.props.placeholder}
        lineWrapping={false}
        onChange={this.handleChange}
        onClick={this.props.onClick}
        readOnly={this.props.readOnly}
        cursorHeight={parseInt(this.props.readOnly, 10)}
        style={this.props.style || this.style()}
      />
    );
  },

  style() {
    return {
      width: '100%',
      height: '90vh'
    };
  },

  handleChange(e) {
    this.props.onChange({
      value: e.target.value
    });
  }

});
