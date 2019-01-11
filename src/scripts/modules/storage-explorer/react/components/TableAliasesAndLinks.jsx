import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router';
import { Table, Row } from 'react-bootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    sapiToken: PropTypes.object.sapiToken,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    onLinkClick: PropTypes.func.isRequired
  },

  render() {
    if (!this.hasAliasesOrLinks()) {
      return null;
    }

    const ownerId = this.props.sapiToken.getIn(['owner', 'id']);
    const isOrganizationMember = this.props.sapiToken.getIn(['admin', 'isOrganizationMember']);

    return (
      <Row>

        <Table responsive striped>
          <thead>
            <tr>
              <th>Table aliases</th>
            </tr>
          </thead>
          <tbody>
            {this.props.tableAliases.map(alias => (
              <tr key={`alias-${alias.get('id')}`}>
                <td>
                  <Link
                    to="storage-explorer-table"
                    params={{ bucketId: alias.getIn(['bucket', 'id']), tableName: alias.get('name') }}
                    onClick={this.props.onLinkClick}
                  >
                    {alias.get('id')}
                  </Link>
                </td>
              </tr>
            ))}

            {this.props.tableLinks.map(alias => {
              const project = alias.get('project');

              return (
                <tr key={`link-${alias.get('id')}`}>
                  <td>
                    {ownerId === project.get('id') && (
                      <Link
                        to="storage-explorer-table"
                        params={{ bucketId: alias.get('bucketId'), tableName: alias.get('tableName') }}
                      >
                        {alias.get('id')}
                      </Link>
                    )}
                    {ownerId !== project.get('id') && isOrganizationMember && (
                      <span>
                        {project.get('name')} / {alias.get('id')}
                      </span>
                    )}
                    {ownerId !== project.get('id') &&
                      isOrganizationMember &&
                      <a href={`/admin/projects/${project.get('id')}`}>{project.get('name')}</a> /
                      (
                        <a href={`/admin/projects/${project.get('id')}/storage#/buckets/${alias.get('id')}`}>
                          {alias.get('id')}
                        </a>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Row>
    );
  },

  hasAliasesOrLinks() {
    return this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0;
  }
});
