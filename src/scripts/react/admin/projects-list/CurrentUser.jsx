import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { Dropdown, MenuItem } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    canManageApps: PropTypes.bool.isRequired,
    maintainers: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="current-user">
        <Dropdown id="current-user-dropdown">
          <Dropdown.Toggle noCaret bsStyle="link">
            <div className="current-user-box text-overflow-ellipsis">
              <span className="current-user-name" title={this.props.user.get('name')}>
                {this.props.user.get('name')}
              </span>
              <span className="current-user-email" title={this.props.user.get('email')}>
                {this.props.user.get('email')}
              </span>
            </div>
            <img src={this.props.user.get('profileImageUrl')} className="current-user-avatar" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <MenuItem href={this.props.urlTemplates.get('changePassword')}>
              Account Settings
            </MenuItem>
            {this.renderAdminItems()}
            {this.renderMaintainers()}
            <MenuItem divider />
            <MenuItem href={this.props.urlTemplates.get('logout')}>Logout</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  },

  renderAdminItems() {
    if (!this.props.canManageApps) {
      return null;
    }

    return [
      <MenuItem key="manageApps" href={this.props.urlTemplates.get('manageApps')}>
        Manage Applications
      </MenuItem>,
      <MenuItem key="syrupJobs" href={this.props.urlTemplates.get('syrupJobsMonitoring')}>
        Syrup Jobs Monitoring
      </MenuItem>
    ];
  },

  renderMaintainers() {
    if (!this.props.maintainers.count()) {
      return null;
    }

    let links = [];

    links.push(<MenuItem key="maintainersHeader" divider />);

    this.props.maintainers.forEach((maintainer) => {
      links.push(
        <MenuItem key={maintainer.get('id')} href={this.maintainerUrl(maintainer)}>
          {maintainer.get('name')}
        </MenuItem>
      );
    });

    return links;
  },

  maintainerUrl(maintainer) {
    return _.template(this.props.urlTemplates.get('maintainer'))({
      maintainerId: maintainer.get('id')
    });
  }
});
