import PropTypes from 'prop-types';
import React from 'react';
import InputMapping from './InputMapping';

export default React.createClass({
  propTypes: {
    onSelect: PropTypes.func.isRequired,
    tables: PropTypes.object.isRequired,
    mapping: PropTypes.object.isRequired,
    exclude: PropTypes.object
  },

  getInitialState() {
    return {
      isSaving: false
    };
  },

  render() {
    return (
      <InputMapping
        mapping={this.props.mapping}
        tables={this.props.tables}
        onChange={this.props.onSelect}
        disabled={this.state.isSaving}
        exclude={this.props.exclude}
      />
    );
  }
});