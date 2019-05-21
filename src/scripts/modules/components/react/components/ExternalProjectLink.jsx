import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';
import { trim, rtrim } from 'underscore.string';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default createReactClass({
  propTypes: {
    stackUrl: PropTypes.string,
    projectId: PropTypes.number,
    children: PropTypes.any
  },

  getProjectUrl() {
    const projectPath = _.template(ApplicationStore.getProjectUrlTemplate())({
      projectId: this.props.projectId
    });

    return `${rtrim(this.props.stackUrl, '/')}/${trim(projectPath, '/')}`;
  },

  render() {
    if (this.props.stackUrl && this.props.projectId) {
      return (
        <ExternalLink href={this.getProjectUrl()}>
          {this.props.children}
        </ExternalLink>
      );
    } else {
      return this.props.children;
    }
  }
});
