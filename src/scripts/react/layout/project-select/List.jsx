import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import fuzzy from 'fuzzy';
import { List, Map } from 'immutable';
import Tooltip from '../../common/Tooltip';
import { SearchBar } from '@keboola/indigo-ui';
import NewProjectModal from '../NewProjectModal';
import Emptylist from './EmptyList';
import InvitationsButton from './InvitationsButton';

export default createReactClass({
  propTypes: {
    organizations: PropTypes.object.isRequired,
    currentProjectId: PropTypes.number.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    projectTemplates: PropTypes.object.isRequired,
    focus: PropTypes.bool.isRequired,
    canCreateProject: PropTypes.bool.isRequired,
    invitationsCount: PropTypes.number,
    xsrf: PropTypes.string.isRequired,
    theme: PropTypes.string
  },

  getInitialState() {
    return {
      query: '',
      selectedProjectId: null,
      selectedOrganizationId: null,
      isNewProjectModalOpen: false
    };
  },

  componentDidMount() {
    if (this.props.focus && this.searchInput) {
      this.searchInput.focus();
    }
  },

  componentDidUpdate(prevProps) {
    if (this.searchInput && this.props.focus && this.props.focus !== prevProps.focus) {
      this.searchInput.focus();
    }
  },

  render() {
    if (!this.props.organizations.count() && !this.props.canCreateProject) {
      return <Emptylist invitationsCount={this.props.invitationsCount} />;
    }

    return (
      <div>
        <div>
          {this._invitationsButton()}
          <SearchBar
            inputRef={element => {
              this.searchInput = element;
            }}
            onChange={this._handleQueryChange}
            query={this.state.query}
            placeholder="Search your projects"
            onKeyDown={this._handleKeyDown}
            theme={this.props.theme}
          />
        </div>
        {this._projectsList()}
        {this.props.canCreateProject && this._newProject()}
      </div>
    );
  },

  _invitationsButton() {
    if (!this.props.invitationsCount) {
      return null;
    }

    return (
      <div>
        <div className="kbc-no-projects">
          <InvitationsButton
            invitationsCount={this.props.invitationsCount}
          />
        </div>
        <hr/>
      </div>
    );
  },

  _projectsList() {
    let elements;
    const organizations = this._organizationsFiltered();
    if (organizations.size) {
      elements = organizations
        .map(organization => {
          const organizationElement = (
            <li className="dropdown-header" key={`org-${organization.get('id')}`}>
              {organization.get('hasAccess') ? (
                <a
                  href={this._organizationUrl(organization.get('id'))}
                  className={this.state.selectedOrganizationId === organization.get('id') ? 'active' : ''}
                >
                  {organization.get('name')}
                </a>
              ) : (
                <span className="disabled">{organization.get('name')}</span>
              )}
            </li>
          );

          const projectElements = organization
            .get('projects')
            .map(project => {
              return (
                <li key={`proj-${project.get('id')}`}>
                  {project.get('isDisabled') ? (
                    <Tooltip tooltip={`Project is disabled. ${project.get('disabledReason')}`} placement="top">
                      <span className="disabled">{project.get('name')}</span>
                    </Tooltip>
                  ) : (
                    <a
                      href={this._projectUrl(project.get('id'))}
                      className={this.state.selectedProjectId === project.get('id') ? 'active' : ''}
                    >
                      {project.get('name')}
                    </a>
                  )}
                </li>
              );
            })
            .toArray();

          return [[organizationElement], projectElements];
        })
        .flatten()
        .toArray();
    } else {
      elements = (
        <li className="">
          <a className="kbc-link-disabled">
            <em>No projects found</em>
          </a>
        </li>
      );
    }

    return <ul className="list-unstyled kbc-project-select-results">{elements}</ul>;
  },

  _organizationsFiltered() {
    const filter = this.state.query;

    return this.props.organizations
      .map(organization =>
        organization.set(
          'projects',
          organization.get('projects').filter(project => fuzzy.match(filter, project.get('name')))
        )
      )
      .filter(organization => {
        if (!filter) {
          return true;
        }
        if (organization.get('projects').count() > 0) {
          return true;
        }
        if (fuzzy.match(filter, organization.get('name'))) {
          return true;
        }
        return false;
      });
  },

  _projectUrl(id) {
    return _.template(this.props.urlTemplates.get('project'))({ projectId: id });
  },

  _organizationUrl(id) {
    return _.template(this.props.urlTemplates.get('organization'))({ organizationId: id });
  },

  _handleQueryChange(changedQuery) {
    return this.setState({
      query: changedQuery
    });
  },

  _handleKeyDown(keyDown) {
    switch (keyDown) {
      case 'ArrowDown':
        return this._selectNextProjectOrOrganization();
      case 'ArrowUp':
        return this._selectPreviousProjectOrOrganization();
      case 'Enter':
        return this._goToSelectedProjectOrOrganization();
      default:
        break;
    }
  },

  _selectNextProjectOrOrganization() {
    return this._moveSelectedProjecteOrOrganization(false);
  },

  _selectPreviousProjectOrOrganization() {
    return this._moveSelectedProjecteOrOrganization(true);
  },

  _moveSelectedProjecteOrOrganization(previous = false) {
    const organizations = this._organizationsFiltered();
    if (!organizations.count()) {
      return;
    }

    // flat map of organizations and projects
    const organizationsAndProjects = organizations
      .map(organization => {
        const org = Map({
          type: 'organization',
          id: organization.get('id')
        });

        const projects = organization.get('projects').map(project =>
          Map({
            type: 'project',
            id: project.get('id')
          })
        );

        return List([List([org]), projects]);
      })
      .flatten(2);

    if (!this.state.selectedProjectId && !this.state.selectedOrganizationId) {
      let item;
      if (previous) {
        item = organizationsAndProjects.last();
      } else {
        item = organizationsAndProjects.first();
      }

      return this._setSelectedItem(item);
    }

    const selectedIndex = organizationsAndProjects.findIndex(item => {
      let id, type;
      if (this.state.selectedProjectId) {
        id = this.state.selectedProjectId;
        type = 'project';
      } else {
        id = this.state.selectedOrganizationId;
        type = 'organization';
      }
      return item.get('id') === id && item.get('type') === type;
    });

    const newIndex = previous ? selectedIndex - 1 : selectedIndex + 1;
    const newSelected = organizationsAndProjects.get(newIndex);
    if (!newSelected) {
      //    go back to first which is always organization
      return this.setState({
        selectedProjectId: null,
        selectedOrganizationId: organizationsAndProjects.first().get('id')
      });
    } else {
      return this._setSelectedItem(newSelected);
    }
  },

  _goToSelectedProjectOrOrganization() {
    if (this.state.selectedProjectId) {
      window.location.href = this._projectUrl(this.state.selectedProjectId);
    } else if (this.state.selectedOrganizationId) {
      window.location.href = this._organizationUrl(this.state.selectedOrganizationId);
    }
  },

  _setSelectedItem(item) {
    if (item.get('type') === 'organization') {
      return this.setState({
        selectedProjectId: null,
        selectedOrganizationId: item.get('id')
      });
    } else {
      return this.setState({
        selectedProjectId: item.get('id'),
        selectedOrganizationId: null
      });
    }
  },

  _newProject() {
    return (
      <ul className="list-unstyled kbc-project-select-new">
        <li>
          <a onClick={this.openModal}>
            <i className="kbc-icon-plus" />
            New Project
          </a>
          <NewProjectModal
            urlTemplates={this.props.urlTemplates}
            projectTemplates={this.props.projectTemplates}
            xsrf={this.props.xsrf}
            isOpen={this.state.isNewProjectModalOpen}
            onHide={this.closeModal}
            organizations={this.props.organizations.filter(organization => organization.get('hasAccess'))}
          />
        </li>
      </ul>
    );
  },

  openModal() {
    return this.setState({
      isNewProjectModalOpen: true
    });
  },

  closeModal() {
    return this.setState({
      isNewProjectModalOpen: false
    });
  }
});
