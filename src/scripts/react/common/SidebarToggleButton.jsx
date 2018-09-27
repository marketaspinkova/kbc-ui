import React from 'react';
import _ from 'underscore';

export default React.createClass({
  _toggleSidebar() {
    document.querySelectorAll('.sidebar-offset-row')[0].classList.toggle('active');
  },

  componentDidMount() {
    const links = document.querySelectorAll('.nav.nav-sidebar > li > a');
    const sidebarRow = document.querySelectorAll('.sidebar-offset-row')[0];

    _.map(links, link =>
      link.addEventListener('click', () => {
        sidebarRow.classList.remove('active');
      })
    );
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
