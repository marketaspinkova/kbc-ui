import React from 'react';

export default React.createClass({
  _toggleSidebar() {
    document.querySelectorAll('.sidebar-offset-row')[0].classList.toggle('active');
  },

  render() {
    return (
      <button type="button" className="navbar-toggle" onClick={this._toggleSidebar}>
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </button>
    );
  }
});
