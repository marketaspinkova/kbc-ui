import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import { fromJS } from 'immutable';

import * as helpers from './helpers';
import ProjectGraph from './react/admin/project-graph/Index';

const Navigation = () => {
  return (
    <nav className="navbar navbar-fixed-top kbc-navbar" role="navigation">
      <div className="col-xs-10">
        <div>
          <div className="kbc-logo col-xs-6">
            <a href="/admin">
              <span className="kbc-icon-keboola-logo" />
            </a>
          </div>

          <div id="kbc-current-user" className="col-xs-4 pull-right">
            <div className="kbc-user">
              <img
                src="https://secure.gravatar.com/avatar/randomavatar?s=40"
                className="kbc-user-avatar"
                width="20"
                height="20"
              />
              <div className="dropdown btn-group">
                <button
                  id="react-layout-current-user-dropdown"
                  role="button"
                  aria-haspopup="true"
                  type="button"
                  className="dropdown-toggle btn btn-link"
                >
                  <span className="kbc-icon-picker"  />
                  <span className="kbc-user-name" >
                    Devel
                  </span>
                </button>
               
              </div>
            </div>
          </div>

          <div className="kbc-notification col-xs-1 pull-right">
            <a href="/admin/account/notifications">
              <span id="kbc-notification-icon">
                <span className="kbc-notification-icon fa fa-bell" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Container = createReactClass({
  propTypes: {
    data: PropTypes.object.isRequired
  },
  render() {
    return (
      <div className="container-fluid col-xs-10">
        <div className="kbc-main">
          <div className="container-fluid">
            <div className="kbc-main-content">
              <div className="row">
                <div className="col-md-3">
                  <h3>Your Account</h3>
                  <ul className="nav nav-pills nav-stacked">
                    <li>
                      <a href="/admin/account/change-password">Account &amp; Security</a>
                    </li>
                    <li>
                      <a href="/admin/account/invitations">Invitations</a>
                    </li>
                    <li>
                      <a href="/admin/account/access-tokens">Access Tokens</a>
                    </li>
                    <li>
                      <a href="/admin/account/notifications">Notifications</a>
                    </li>
                    <li>
                      <a href="/admin/account/promo-codes">Promo Codes</a>
                    </li>
                    <li>
                      <a href="/admin/account/sessions">User Sessions</a>
                    </li>
                  </ul>
                  <h3>Maintainers</h3>

                  <ul className="nav nav-pills nav-stacked">
                    <li>
                      <a href="/admin/maintainers/4">KBC Internal</a>
                    </li>
                  </ul>

                  <h3>Organizations</h3>

                  <ul className="nav nav-pills nav-stacked">
                    <li>
                      <a href="/admin/organizations/1">Keboola Internal</a>
                    </li>
                    <li>
                      <a href="/admin/organizations/4">KBC Testing</a>
                    </li>
                    <li>
                      <a href="/admin/organizations/5">Martinovo</a>
                    </li>
                    <li>
                      <a href="/admin/organizations/104">Jack</a>
                    </li>

                    <li>
                      <a href="/admin/organizations/153">Vlado - testovacia</a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-9">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <div className="kbc-panel-heading-content">
                        Project Overview
                      </div>
                    </div>
                    <div className="panel-body">
                      <div id="kbc-admin-project-overview">
                        <ProjectGraph
                          token={this.props.data.getIn(['sapi', 'token'])}
                          services={this.props.data.get('services')}
                          urlTemplates={this.props.data.getIn(['kbc', 'urlTemplates'])}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default {
  start: function(appOptions) {
    ReactDOM.render(
      <div className="kbc-single-page kbc-admin-module">
        <Navigation />
        <Container data={fromJS(appOptions.data)} />
      </div>,
      document.getElementById('react')
    );
  },
  helpers
};
