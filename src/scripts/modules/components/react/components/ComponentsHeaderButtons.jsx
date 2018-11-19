import React from 'react';
import NewComponentButton from './NewComponentButton';

export default React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    addRoute: React.PropTypes.string.isRequired
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
