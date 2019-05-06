import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { FormControl } from 'react-bootstrap';
import matchByWords from '../../../utils/matchByWords';

export default createReactClass({
  propTypes: {
    organizations: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      searchQuery: ''
    };
  },

  render() {
    console.log(this.props.organizations.toJS()); // eslint-disable-line
    return (
      <div>
        <div className="projects-list-searchbar">
          <FormControl
            autoFocus
            type="text"
            placeholder="Search your projects"
            value={this.state.searchQuery}
            onChange={this.handleChangeSearchQuery}
          />
        </div>
        <div className="projects-list">
          {this.props.organizations.map((organization) => {
            let projects = organization.get('projects');

            if (this.state.searchQuery) {
              const searchQuery = this.state.searchQuery.toLowerCase();
              projects = projects.filter((project) =>
                matchByWords(project.get('name').toLowerCase(), searchQuery)
              );
            }

            if (!projects.count()) {
              return null;
            }

            return (
              <div key={organization.get('id')} className="organization-list">
                <a href={this.organizationUrl(organization.get('id'))}>
                  {organization.get('name')}
                </a>
                <ul>{this.renderProjects(projects)}</ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  },

  renderProjects(projects) {
    return projects.map((project) => (
      <li key={project.get('id')}>
        <a href={this.projectUrl(project.get('id'))}>{project.get('name')}</a>
      </li>
    ));
  },

  handleChangeSearchQuery(e) {
    this.setState({ searchQuery: e.target.value });
  },

  projectUrl(id) {
    return _.template(this.props.urlTemplates.get('project'))({ projectId: id });
  },

  organizationUrl(id) {
    return _.template(this.props.urlTemplates.get('organization'))({ organizationId: id });
  }
});
