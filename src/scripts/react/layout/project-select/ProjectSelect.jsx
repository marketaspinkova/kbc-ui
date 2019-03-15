import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import ProjectsList from './List';

import { Icon } from '@keboola/indigo-ui';
import { Dropdown } from 'react-bootstrap';

export default createReactClass({

  propTypes: {
    organizations: PropTypes.object.isRequired,
    currentProject: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    projectTemplates: PropTypes.object.isRequired,
    xsrf: PropTypes.string.isRequired,
    canCreateProject: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {open: false};
  },

  render() {
    return (
      <Dropdown
        id="select-project-dropdown-button"
        className="kbc-project-select"
        onToggle={this._handleToggle}
      >
        <Dropdown.Toggle noCaret>
          {this.state.open ?
            <Icon.Times className="pull-right icon-size-16"/> :
            <Icon.ArrowDown className="pull-right icon-size-16"/>
          }
          <span className="kbc-project-name">
            {this.props.currentProject.get('name')}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <ProjectsList
            organizations={this.props.organizations}
            currentProjectId={this.props.currentProject.get('id')}
            urlTemplates={this.props.urlTemplates}
            projectTemplates={this.props.projectTemplates}
            xsrf={this.props.xsrf}
            canCreateProject={this.props.canCreateProject}
            focus={this.state.open}
            theme="inverse"
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  },

  _handleToggle(isOpen) {
    this.setState({open: isOpen});
  }
});
