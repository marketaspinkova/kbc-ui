import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import _ from 'underscore';
import { Badge, ProgressBar, Table } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import { scoreStyle } from './utils';

export default createReactClass({
  propTypes: {
    projectId: PropTypes.number.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    nodes: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    reability: PropTypes.object.isRequired,
    issues: PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <br />

        <Table striped responsive className="table-no-margin">
          <tbody>
            <tr>
              <td>Total connected projects</td>
              <td className="text-right">{this.props.nodes.count()}</td>
            </tr>
            <tr>
              <td>Total shared buckets between projects</td>
              <td className="text-right">{this.props.links.count()}</td>
            </tr>
          </tbody>
        </Table>

        <br />

        <h3>Reliability score</h3>

        <ProgressBar
          max={1}
          label={`Score ${this.props.reability.get('reliabilityScore') * 100} of 100`}
          bsStyle={scoreStyle(this.props.reability.get('reliabilityScore'))}
          now={this.props.reability.get('reliabilityScore')}
          className="progress-big"
        />

        <br />

        <h3>
          Project issues{' '}
          <Badge title="number of issues">{this.props.reability.get('issueCount', 0)}</Badge>
        </h3>

        {this.props.issues.count() > 0 ? (
          <Table striped responsive className="issues-table">
            <tbody>{this.props.issues.map(this.renderIssueRow).toArray()}</tbody>
          </Table>
        ) : (
          <p>Congratulations. No issues was found.</p>
        )}
      </div>
    );
  },

  renderIssueRow(issue) {
    const count = issue.get('data', List()).count();
    const projectLink = _.template(this.props.urlTemplates.get('project'))({
      projectId: this.props.projectId
    });

    switch (issue.get('reason')) {
      case 'outdated-transformations':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} outdated transformation{count > 1 ? 's' : ''}
            </td>
            <td className="text-right">
              {issue
                .get('data')
                .map((transformation, index) => {
                  const configurationId = transformation.get('configuration_id');
                  const rowId = transformation.get('row_id');

                  return (
                    <p key={index}>
                      <ExternalLink
                        href={`${projectLink}transformations/bucket/${configurationId}/transformation/${rowId}`}
                      >
                        Go to transformation {configurationId} ({rowId})
                      </ExternalLink>
                    </p>
                  );
                })
                .toArray()}
            </td>
          </tr>
        );

      case 'deprecated-components':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} deprecated component{count > 1 ? 's' : ''} used
            </td>
            <td className="text-right">
              {issue
                .get('data')
                .map((component) => {
                  return <p key={component}>{component}</p>;
                })
                .toArray()}
            </td>
          </tr>
        );

      case 'inactive-tokens':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} inactive token{count > 1 ? 's' : ''}
            </td>
            {count > 5 ? (
              <td className="text-right">
                <ExternalLink href={`${projectLink}tokens`}>Go to tokens page.</ExternalLink>
              </td>
            ) : (
              <td className="text-right">
                {issue
                  .get('data')
                  .map((tokenId, index) => {
                    return (
                      <p key={index}>
                        <ExternalLink href={`${projectLink}tokens/${tokenId}`}>
                          Go to token {tokenId}
                        </ExternalLink>
                      </p>
                    );
                  })
                  .toArray()}
              </td>
            )}
          </tr>
        );

      case 'orchestrations-without-notifications':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} orchestration{count > 1 ? 's' : ''} without notifications
            </td>
            <td className="text-right">
              {issue
                .get('data')
                .map((orchestrationId, index) => {
                  return (
                    <p key={index}>
                      <ExternalLink href={`${projectLink}orchestrations/${orchestrationId}`}>
                        Go to ochestration {orchestrationId}
                      </ExternalLink>
                    </p>
                  );
                })
                .toArray()}
            </td>
          </tr>
        );

      case 'orchestrations-without-tasks':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} orchestration{count > 1 ? 's' : ''} without tasks
            </td>
            <td className="text-right">
              {issue
                .get('data')
                .map((orchestrationId, index) => {
                  return (
                    <p key={index}>
                      <ExternalLink href={`${projectLink}orchestrations/${orchestrationId}`}>
                        Go to ochestration {orchestrationId}
                      </ExternalLink>
                    </p>
                  );
                })
                .toArray()}
            </td>
          </tr>
        );

      case 'failed-orchestrations':
        return (
          <tr key={issue.get('reason')}>
            <td>Recently many orchestrations failed</td>
          </tr>
        );

      case 'failed-jobs':
        return (
          <tr key={issue.get('reason')}>
            <td>Recently many jobs failed</td>
          </tr>
        );

      case 'dead-project':
        return (
          <tr key={issue.get('reason')}>
            <td>The project seems to be dead. No activity was detected for some time.</td>
          </tr>
        );

      case 'configuration-issue':
        return (
          <tr key={issue.get('reason')}>
            <td>
              {count} configuration{count > 1 ? 's' : ''} issues
            </td>
          </tr>
        );

      default:
        return null;
    }
  }
});
