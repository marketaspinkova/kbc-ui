import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router';
import { Table, Row } from 'react-bootstrap';
import ProjectAliasLink from './ProjectAliasLink';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    onLinkClick: PropTypes.func.isRequired
  },

  render() {
    if (!this.hasAliasesOrLinks()) {
      return null;
    }

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

            {this.props.tableLinks.map(alias => (
              <tr key={`link-${alias.get('id')}`}>
                <td>
                  <ProjectAliasLink
                    sapiToken={this.props.sapiToken}
                    urlTemplates={this.props.urlTemplates}
                    alias={alias}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    );
  },

  hasAliasesOrLinks() {
    return this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0;
  }
});
