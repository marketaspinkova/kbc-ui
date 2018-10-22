import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import MySqlDataTypes from './MySqlDataTypes';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      selectValue: '',
      inputValue: ''
    };
  },

  _handleSelectOnChange(selected) {
    return this.setState({
      selectValue: selected ? selected.value : ''
    });
  },

  _handleInputOnChange(value) {
    return this.setState({
      inputValue: value
    });
  },

  _handleAddDataType() {
    const value = this.props.value.set(this.state.selectValue, this.state.inputValue);
    this.props.onChange(value);
    return this.setState({
      selectValue: '',
      inputValue: ''
    });
  },

  _handleRemoveDataType(key) {
    const value = this.props.value.remove(key);
    return this.props.onChange(value);
  },

  render() {
    return (
      <MySqlDataTypes
        datatypes={this.props.value}
        selectValue={this.state.selectValue}
        inputValue={this.state.inputValue}
        columnsOptions={this.props.columnsOptions}
        selectOnChange={this._handleSelectOnChange}
        inputOnChange={this._handleInputOnChange}
        handleAddDataType={this._handleAddDataType}
        handleRemoveDataType={this._handleRemoveDataType}
        disabled={this.props.disabled}
      />
    );
  }
});
