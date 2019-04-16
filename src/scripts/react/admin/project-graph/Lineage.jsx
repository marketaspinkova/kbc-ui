import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { Map, List } from 'immutable';
import { Table, Badge, ProgressBar } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Tooltip from '../../common/Tooltip';
import { scoreStyle } from './utils';

export default createReactClass({
  propTypes: {
    lineage: PropTypes.object.isRequired,
    reability: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  render() {
    return (
      <Table className="lineage-table kbc-break-all kbc-break-word" responsive>
        {this.renderLineageHeader()}
        <tbody>
          {this.lineageData()
            .map((group, level) => (
              <tr key={level}>
                <td>Level {level}</td>
                <td>
                  {this.renderParentLinks(group)}
                </td>
                <td>
                  {this.renderChildLinks(group)}
                </td>
              </tr>
            ))
            .toArray()}
        </tbody>
      </Table>
    );
  },

  renderLineageHeader() {
    return (
      <thead>
        <tr>
          <th />
          <th>
            <div className="icon-arrow">
              <i className="fa fa-arrow-down fa-2x" />
              <span>IN</span>
            </div>
          </th>
          <th>
            <div className="icon-arrow">
              <span>OUT</span>
              <i className="fa fa-arrow-up fa-2x" />
            </div>
          </th>
        </tr>
      </thead>
    );
  },

  renderParentLinks(group) {
    return group.get('parent', List()).map((project) => this.renderProjectLink(project));
  },

  renderChildLinks(group) {
    return group.get('child', List()).map((project) => this.renderProjectLink(project));
  },

  renderProjectLink(project) {
    const reability = this.props.reability.get(project.get('id'), Map());

    return (
      <div className="lineage-item" key={project.get('id')}>
        <div className="lineage-link">
          <Tooltip tooltip="Open project" placement="top">
            <span>
              <ExternalLink
                href={_.template(this.props.urlTemplates.get('project'))({
                  projectId: project.get('id')
                })}
              >
                {project.get('title')}
              </ExternalLink>
            </span>
          </Tooltip>

          <Tooltip tooltip="Open project overview" placement="top">
            <span>
              <ExternalLink
                href={_.template(this.props.urlTemplates.get('projectOverview'))({
                  projectId: project.get('id')
                })}
              >
                <i className="fa fa-sitemap" />
              </ExternalLink>
            </span>
          </Tooltip>
        </div>
        <div className="lineage-reability" style={{ marginBottom: '10px' }}>
          <ProgressBar
            max={1}
            label={`Score ${reability.get('reliabilityScore') * 100} of 100`}
            bsStyle={scoreStyle(reability.get('reliabilityScore'))}
            now={reability.get('reliabilityScore')} 
          />

          <Tooltip tooltip="Project issues" placement="top">
            <Badge>{reability.get('issueCount', 0)}</Badge>
          </Tooltip>
        </div>
      </div>
    );
  },

  lineageData() {
    return this.props.lineage
      .groupBy((data) => data.get('distance'))
      .toKeyedSeq()
      .sort()
      .map((distance) => distance.groupBy((data) => data.get('role')));
  }
});
