import React from 'react';
import ApplicationStore from '../../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';

export default React.createClass({
  propTypes: {
    stackUrl: React.PropTypes.string,
    projectId: React.PropTypes.number,
    children: React.PropTypes.any
  },

  getProjectUrl() {
    const projectPath = _.template(ApplicationStore.getProjectUrlTemplate())({
      projectId: this.props.projectId
    });
    return this.props.stackUrl + projectPath.substring(1, projectPath.length - 1);
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
