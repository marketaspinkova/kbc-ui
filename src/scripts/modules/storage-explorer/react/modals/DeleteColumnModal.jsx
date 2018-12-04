import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Modal, ButtonToolbar, Button, Checkbox, Table } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    column: PropTypes.string.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    deleting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    sapiToken: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      forceDelete: false
    };
  },

  render() {
    return (
      <Modal onHide={this.onHide} show={true}>
        <Modal.Header closeButton>
          <Modal.Title>Delete column</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you really want to delete column <b>{this.props.column}</b>?
          </p>

          {this.hasAliasesOrLinks() && (
            <div>
              <Checkbox checked={this.state.forceDelete} onChange={this.toggleForceDelete}>
                Delete column from table and table aliases
              </Checkbox>

              <Table>
                <thead>
                  <tr>
                    <th>Table aliases</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.tableAliases.map(alias => {
                    return (
                      <tr key={alias.get('id')}>
                        <td>
                          <Link
                            to="storage-explorer-table"
                            params={{ bucketId: alias.getIn(['bucket', 'id']), tableName: alias.get('name') }}
                            onClick={this.onHide}
                          >
                            {alias.get('id')}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {this.props.tableLinks.map(alias => {
                    const ownerId = this.props.sapiToken.getIn(['owner', 'id']);
                    const isOrganizationMember = this.props.sapiToken.getIn(['admin', 'isOrganizationMember']);
                    const project = alias.get('project');

                    return (
                      <tr key={alias.get('id')}>
                        <td>
                          {ownerId === project.get('id') && (
                            <Link
                              to="storage-explorer-table"
                              params={{ bucketId: alias.get('bucketId'), tableName: alias.get('tableName') }}
                              onClick={this.onHide}
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={this.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button onClick={this.handleConfirm} disabled={this.isDisable()} bsStyle="danger">
              {this.props.deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  toggleForceDelete() {
    this.setState({
      forceDelete: !this.state.forceDelete
    });
  },

  onHide() {
    this.setState({ forceDelete: false });
    this.props.onHide();
  },

  handleConfirm() {
    this.props.onConfirm(this.state.forceDelete).then(this.onHide);
  },

  isDisable() {
    if (this.hasAliasesOrLinks() && !this.state.forceDelete) {
      return true;
    }

    return this.props.deleting;
  },

  hasAliasesOrLinks() {
    return this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0;
  }
});
