import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { FormControl } from 'react-bootstrap';
import matchByWords from '../../../utils/matchByWords';
import Tooltip from '../../../react/common/Tooltip';

import './projects-list.less';

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
    return (
      <div className="projects-list-box">
        <div className="projects-list-searchbar">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.9998 16.0766L23.6736 20.7495C24.1096 21.1901 24.1096 21.9025 23.6689 22.3431L22.3423 23.6696C21.9063 24.1101 21.1937 24.1101 20.7531 23.6696L16.0793 18.9966C15.8683 18.7857 15.7512 18.4998 15.7512 18.1998V17.4358C14.0963 18.7294 12.0149 19.4981 9.75071 19.4981C4.36438 19.4981 0 15.1345 0 9.74905C0 4.36364 4.36438 0 9.75071 0C15.137 0 19.5014 4.36364 19.5014 9.74905C19.5014 12.0129 18.7326 14.0939 17.4388 15.7485H18.2029C18.5029 15.7485 18.7889 15.8656 18.9998 16.0766ZM3.75 9.74905C3.75 13.0675 6.43614 15.7485 9.75045 15.7485C13.0695 15.7485 15.7509 13.0628 15.7509 9.74905C15.7509 6.43062 13.0648 3.74963 9.75045 3.74963C6.43145 3.74963 3.75 6.43531 3.75 9.74905Z"
              fill="#C8CAD9"
            />
          </svg>
          <FormControl
            autoFocus
            type="text"
            placeholder="Search your projects"
            value={this.state.searchQuery}
            onChange={this.handleChangeSearchQuery}
          />
        </div>
        <div className="projects-list">
          {!this.hasResults() && <p className="organization-list">No project found</p>}
          {this.props.organizations
            .sortBy((organization) => organization.get('name').toLowerCase())
            .map((organization) => {
              let projects = organization.get('projects');

              if (this.state.searchQuery) {
                const searchQuery = this.state.searchQuery.toLowerCase();
                projects = projects.filter((project) =>
                  matchByWords(project.get('name').toLowerCase(), searchQuery)
                );
              }

              return (
                <div key={organization.get('id')} className="organization-list">
                  {this.renderOrganization(organization)}
                  {projects.count() > 0 && (
                    <ul>
                      {projects
                        .sortBy((project) => project.get('name').toLowerCase())
                        .map((project) => (
                          <li key={project.get('id')}>{this.renderProject(project)}</li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },

  renderOrganization(organization) {
    if (!organization.get('hasAccess')) {
      return <span className="disabled organization-link">{organization.get('name')}</span>;
    }

    return (
      <a href={this.organizationUrl(organization.get('id'))} className="organization-link">
        {organization.get('name')}
      </a>
    );
  },

  renderProject(project) {
    if (project.get('isDisabled')) {
      return (
        <Tooltip tooltip={`Project is disabled. ${project.get('disabledReason')}`} placement="top">
          <span className="disabled project-link">{project.get('name')}</span>
        </Tooltip>
      );
    }

    return (
      <a href={this.projectUrl(project.get('id'))} className="project-link">
        {project.get('name')}
      </a>
    );
  },

  handleChangeSearchQuery(e) {
    this.setState({ searchQuery: e.target.value });
  },

  organizationUrl(id) {
    return _.template(this.props.urlTemplates.get('organization'))({ organizationId: id });
  },

  projectUrl(id) {
    return _.template(this.props.urlTemplates.get('project'))({ projectId: id });
  },

  hasResults() {
    const searchQuery = this.state.searchQuery.toLowerCase();
    return (
      this.props.organizations
        .filter((organization) => {
          let projects = organization.get('projects');

          if (searchQuery) {
            projects = projects.filter((project) =>
              matchByWords(project.get('name').toLowerCase(), searchQuery)
            );
          }

          return projects.count() > 0;
        })
        .count() > 0
    );
  }
});
