import React from 'react';
import classNames from 'classnames';

export default React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <button
        type="button"
        className={classNames('toggle', {'open': this.props.isOpen})}
        onClick={this.props.onClick}>
        <span className="toggle-bar" />
      </button>
    );
  }
});
