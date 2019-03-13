import PropTypes from 'prop-types';
import React from 'react';
import NewComponentButton from './NewComponentButton';

export default React.createClass({
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
