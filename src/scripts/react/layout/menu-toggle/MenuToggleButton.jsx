import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <Button
        bsClass=""
        className={classNames('menu-toggle', {'menu-toggle-open': this.props.isOpen})}
        onClick={this.props.onClick}>
        <span className="menu-toggle-icon" />
      </Button>
    );
  }
});
