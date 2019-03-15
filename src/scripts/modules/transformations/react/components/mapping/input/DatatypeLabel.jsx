import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import getDatatypeLabel from './getDatatypeLabel';
import {Map} from 'immutable';

export default createReactClass({
  propTypes: {
    column: PropTypes.string.isRequired,
    datatype: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ])
  },

  renderConvertEmptyValuesToNull() {
    if (Map.isMap(this.props.datatype)) {
      if (this.props.datatype.has('convertEmptyValuesToNull') && this.props.datatype.get('convertEmptyValuesToNull') === true) {
        return (<span>, convert emtpy values to <code>null</code></span>);
      }
    }
    return null;
  },

  render() {
    return (
      <span>
        <strong>{this.props.column}</strong>
        <code>{getDatatypeLabel(this.props.datatype)}</code>
        {this.renderConvertEmptyValuesToNull()}
      </span>
    );
  }
});
