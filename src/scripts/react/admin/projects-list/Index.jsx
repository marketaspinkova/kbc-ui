import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import OverviewImage from '../../../../images/Login.png';
import ProjectList from './ProjectList';
import CurrentUser from './CurrentUser';

export default createReactClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    maintainers: PropTypes.object.isRequired,
    organizations: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="container-fluid login-page">
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-5 col-lg-4 main">
            <section className="top-content">
              <a href="/admin/projects" className="keboola-logo">
                <span className="kbc-icon-keboola-logo" />
              </a>
              <CurrentUser
                canManageApps
                user={this.props.user}
                maintainers={this.props.maintainers}
                urlTemplates={this.props.urlTemplates}
              />
            </section>
            <section>
              <ProjectList
                organizations={this.props.organizations}
                urlTemplates={this.props.urlTemplates}
              />
            </section>
            <section className="bottom-content">
              <p>
                Keboola Industries. 2019,{' '}
                <a
                  href="https://www.keboola.com/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>
              </p>
            </section>
          </div>
          <div className="hidden-xs col-sm-6 col-md-7 col-lg-8 overview">
            <img src={OverviewImage} className="img-responsive" alt="New dashboard features" />
            <div className="overview-text">
              <h2>New dashboard</h2>
              <p>Important informations always visible to you, no need to look for them.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
