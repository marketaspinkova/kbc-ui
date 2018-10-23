import React from 'react';
import Immutable from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import MySqlIndexes from './MySqlIndexes';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return { selectValue: Immutable.List() };
  },

  _handleSelectOnChange(value) {
    return this.setState({
      selectValue: Immutable.fromJS(value)
    });
  },

  _handleAddIndex() {
    const value = this.props.value.push(this.state.selectValue);
    this.props.onChange(value);
    return this.setState({
      selectValue: Immutable.List()
    });
  },

  _handleRemoveIndex(key) {
    const value = this.props.value.remove(key);
    return this.props.onChange(value);
  },

  render() {
    return (
      <MySqlIndexes
        indexes={this.props.value}
        selectValue={this.state.selectValue}
        columnsOptions={this.props.columnsOptions}
        selectOnChange={this._handleSelectOnChange}
        handleAddIndex={this._handleAddIndex}
        handleRemoveIndex={this._handleRemoveIndex}
        disabled={this.props.disabled}
      />
    );
  }
});
