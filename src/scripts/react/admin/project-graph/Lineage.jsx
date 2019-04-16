import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { List } from 'immutable';
import { Table, Label } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Tooltip from '../../common/Tooltip';

export default createReactClass({
  propTypes: {
    data: PropTypes.object.isRequired,
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
                  {this.renderGroupCountLabel(group, 'parent')}
                  {this.renderParentLinks(group)}
                </td>
                <td>
                  {this.renderGroupCountLabel(group, 'child')}
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

  renderGroupCountLabel(group, section) {
    return <Label className="group-label">{group.get(section, List()).count()}</Label>;
  },

  renderParentLinks(group) {
    return group.get('parent', List()).map((project) => this.renderProjectLink(project));
  },

  renderChildLinks(group) {
    return group.get('child', List()).map((project) => this.renderProjectLink(project));
  },

  renderProjectLink(project) {
    return (
      <div className="lineage-link" key={project.get('id')}>
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
    );
  },

  lineageData() {
    if (!this.props.data.get('lineage')) {
      return List();
    }

    return this.props.data
      .get('lineage')
      .groupBy((data) => data.get('distance'))
      .toKeyedSeq()
      .sort()
      .map((distance) => distance.groupBy((data) => data.get('role')));
  }
});
