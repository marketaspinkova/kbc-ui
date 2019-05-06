import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import {ExternalLink} from '@keboola/indigo-ui';
import * as helpers from './helpers';

const App = createReactClass({
  render() {
    return (
      <div id="kbc-main-app">
        <nav className="navbar navbar-fixed-top kbc-navbar" role="navigation">
          <div className="col-xs-3 kbc-logo">
            <a href="#">
              <span className="kbc-icon-keboola-logo" />
            </a>

            <a href="#">
              <span className="kbc-notification-icon fa fa-bell">
                <span className="kbc-notification-icon-badge">
                  <span className="kbc-notification-icon-badge-inner" />
                </span>
              </span>
            </a>
          </div>

          <div className="col-xs-9  col-xs-offset-3 kbc-main-header-container">
            <div className="kbc-main-header kbc-header">
              <div className="kbc-title">
                <h1>Settings</h1>
              </div>
              <div className="kbc-buttons" />
            </div>
          </div>
        </nav>

        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-3 kbc-sidebar">
              <div id="kbc-project-select">
                <div className="kbc-project-select dropdown">
                  <button title="Vlado - workspace">
                    <span>
                      <span className="kbc-icon-picker-double" />
                      <span className="kbc-project-name">Vlado - workspace</span>
                    </span>
                  </button>
                </div>
              </div>

              <ul className="kbc-nav-sidebar nav nav-sidebar">
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-overview" />
                    <span>Overview</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-extractors" />
                    <span>Extractors</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-transformations" />
                    <span>Transformations</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-writers" />
                    <span>Writers</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-orchestrations" />
                    <span>Orchestrations</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-storage" />
                    <span>Storage</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-jobs" />
                    <span>Jobs</span>
                  </a>
                </li>
                <li className="">
                  <a href="#">
                    <span className="kbc-icon-applications" />
                    <span>Applications</span>
                  </a>
                </li>
              </ul>

              <div className="kbc-sidebar-footer">
                <div className="kbc-user" id="kbc-user">
                  <div className="kbc-user">
                    <img
                      src="https://secure.gravatar.com/avatar/ecdb3ba33f2ada77650dc6106646c86a?s=40&amp;d=mm"
                      className="kbc-user-avatar"
                      width="40"
                      height="40"
                    />
                    <div className="dropup btn-group">
                      <button
                        id="react-layout-current-user-dropdown"
                        role="button"
                        aria-haspopup="true"
                        type="button"
                        className="dropdown-toggle btn btn-link"
                      >
                        <span className="kbc-icon-picker" />
                        <span className="kbc-user-name">Vladimír Kriška</span>
                        <span className="kbc-user-email">email address</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="kbc-user-links">
                  <ul className="nav">
                    <li>
                      <a href="#">
                        <span className="fa fa-comment" /> Support
                      </a>
                    </li>
                    <li>
                      <ExternalLink href="#">
                        <span className="fa fa-question-circle" /> Help
                      </ExternalLink>
                    </li>
                    <li>
                      <a href="#">
                        <span className="fa fa-user" /> Users &amp; Settings
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xs-9 col-xs-offset-3 kbc-main ">
              <div className="container-fluid">
                <div className="kbc-main-content kbc-project-users">
                  <ul className="nav nav-tabs">
                    <li role="presentation" className="active">
                      <a href="#">Users</a>
                    </li>
                    <li role="presentation">
                      <a href="#">Settings</a>
                    </li>
                    <li role="presentation">
                      <a href="#">API Tokens</a>
                    </li>
                    <li role="presentation">
                      <a href="#">Limits</a>
                    </li>
                    <li role="presentation">
                      <a href="#">Project Power</a>
                    </li>
                    <li role="presentation">
                      <a href="#">Trash</a>
                    </li>
                  </ul>

                  <div className="tab-content">
                    <div className="tab-pane tab-pane-no-padding active">
                      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
                        <div className="row">
                          <div className="col-md-9">
                              All users have full permissions in the project and can add or remove other users
                              from it.
                          </div>
                          <div className="col-md-3 text-right">
                            <a
                              href="#"
                              className="kb-add-new-administrator-modal btn btn-success"
                              data-toggle="tooltip"
                              title="Add new user"
                            >
                              <i className="kbc-icon-plus" />New User
                            </a>
                          </div>
                        </div>


                      </div>
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th />
                            <th>Name</th>
                            <th>Email</th>
                            <th>
                              MFA{' '}
                              <span
                                className="fa fa-question-circle"
                                data-toggle="tooltip"
                                title="Multi-Factor Authentication"
                              />
                            </th>
                            <th>Reason</th>
                            <th>Joined</th>
                            <th>Expires</th>
                            <th className="kbc-action-column">
                              <span className="fa" />
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="">
                            <td style={{ position: 'relative' }}>
                              <img
                                src="https://secure.gravatar.com/avatar/8117e4a19169f5a85ba7a8a77a3f02ef?s=40&amp;d=mm"
                                width="40"
                                height="40"
                                className="kbc-user-avatar"
                              />
                            </td>
                            <td>marc raiser</td>
                            <td>email address</td>
                            <td>
                              <span className="fa fa-check" />
                            </td>
                            <td>
                              <strong>spying:)</strong>
                            </td>
                            <td>
                              <span
                                className="kb-date-convert"
                                data-date="2016-07-22T15:37:20+0200"
                                title="2016-07-22T15:37:20+0200"
                              >
                                  2016-07-22 15:37
                              </span>
                            </td>
                            <td />
                            <td>
                              <div className="kbc-action-column">
                                <a href="#" className="kb-confirm text-muted">
                                  <span className="kbc-icon-cup" />
                                  Remove
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr className="">
                            <td style={{ position: 'relative' }}>
                              <img
                                src="https://secure.gravatar.com/avatar/0f7ad98cc5b6e8daff602989f0325d63?s=40&amp;d=mm"
                                width="40"
                                height="40"
                                className="kbc-user-avatar"
                              />
                            </td>
                            <td>Martin Halamíček</td>
                            <td>email address</td>
                            <td>
                              <span className="fa fa-check" />
                            </td>
                            <td />
                            <td>
                              <span className="text-muted">N/A</span>
                            </td>
                            <td />
                            <td>
                              <div className="kbc-action-column">
                                <a href="#" className="kb-confirm text-muted">
                                  <span className="kbc-icon-cup" />
                                  Remove
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr className="">
                            <td style={{ position: 'relative' }}>
                              <img
                                src="https://secure.gravatar.com/avatar/f3d76c19c874d9fbe18e0dd37eaa979a?s=40&amp;d=mm"
                                width="40"
                                height="40"
                                className="kbc-user-avatar"
                              />
                            </td>
                            <td>Tomas Kacur</td>
                            <td>email address</td>
                            <td>
                              <span className="fa fa-check" />
                            </td>
                            <td />
                            <td>
                              <span
                                className="kb-date-convert"
                                data-date="2016-04-19T16:41:44+0200"
                                title="2016-04-19T16:41:44+0200"
                              >
                                  2016-04-19 16:41
                              </span>
                            </td>
                            <td />
                            <td>
                              <div className="kbc-action-column">
                                <a href="#" className="kb-confirm text-muted">
                                  <span className="kbc-icon-cup" />
                                  Remove
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr className="">
                            <td style={{ position: 'relative' }}>
                              <img
                                src="https://secure.gravatar.com/avatar/ecdb3ba33f2ada77650dc6106646c86a?s=40&amp;d=mm"
                                width="40"
                                height="40"
                                className="kbc-user-avatar"
                              />
                            </td>
                            <td>Vladimír Kriška</td>
                            <td>email address</td>
                            <td>
                              <span className="fa fa-check" />
                            </td>
                            <td />
                            <td>
                              <span className="text-muted">N/A</span>
                            </td>
                            <td />
                            <td>
                              <div className="kbc-action-column">
                                <a href="#" className="kb-confirm text-muted">
                                  <span className="fa fa-sign-out" />
                                  Leave
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
  start: function() {
    ReactDOM.render(<App />, document.getElementById('react'));
  },
  helpers
};
