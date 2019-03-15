import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import NewComponentButton from './NewComponentButton';

export default createReactClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    addRoute: PropTypes.string.isRequired
  },

  render() {
    return (
      <span>
        <NewComponentButton
          to={this.props.addRoute}
          text={`New ${this.props.type[0].toUpperCase()}${this.props.type.substr(1)}`}
          type={this.props.type}
        />
      </span>
    );
  }
});
