import React from 'react';
import _ from 'underscore';

export default React.createClass({
  _toggleSidebar() {
    document.querySelector('.sidebar-offset-row').classList.toggle('active');
    document.getElementById('toggle').classList.toggle('active');
  },

  componentDidMount() {
    const links = document.querySelectorAll('.nav.nav-sidebar > li > a');
    const sidebarRow = document.querySelector('.sidebar-offset-row');
    const toggle = document.getElementById('toggle');

    _.map(links, link =>
      link.addEventListener('click', () => {
        sidebarRow.classList.remove('active');
        toggle.classList.remove('active');
      })
    );
  },

  render() {
    return (
      <button type="button" id="toggle" onClick={this._toggleSidebar}>
        <span className="toggle-bar" />
      </button>
    );
  }
});
