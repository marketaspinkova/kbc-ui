import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Modal, Table, FormGroup, Checkbox } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    deleting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      forceDelete: false
    };
  },

  render() {
    const ownerId = this.props.sapiToken.getIn(['owner', 'id']);
    const isOrganizationMember = this.props.sapiToken.getIn(['admin', 'isOrganizationMember']);

    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Delete table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you really want to delete table <strong>{this.props.table.get('id')}</strong>?
          </p>

          {this.hasAliasesOrLinks() && (
            <div>
              <FormGroup>
                <Checkbox checked={this.state.forceDelete} onChange={this.toggleForceDelete}>
                  Delete table with all its aliases
                </Checkbox>
              </FormGroup>

              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Table aliases</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.tableAliases.map(alias => (
                    <tr key={alias.get('id')}>
                      <td>
                        <Link
                          to="storage-explorer-table"
                          params={{ bucketId: alias.getIn(['bucket', 'id']), tableName: alias.get('name') }}
                          onClick={this.props.onHide}
                        >
                          {alias.get('id')}
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {this.props.tableLinks.map(alias => {
                    const project = alias.get('project');

                    return (
                      <tr key={alias.get('id')}>
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.deleting}
            isDisabled={this.isDisabled()}
            saveLabel={this.props.deleting ? 'Deleting...' : 'Delete'}
            saveStyle="danger"
            onCancel={this.props.onHide}
            onSave={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  toggleForceDelete() {
    this.setState({
      forceDelete: !this.state.forceDelete
    });
  },

  handleSubmit() {
    this.props.onConfirm(this.state.forceDelete).then(this.props.onHide);
  },

  hasAliasesOrLinks() {
    return this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0;
  },

  isDisabled() {
    return (this.hasAliasesOrLinks() && !this.state.forceDelete) || this.props.deleting;
  }
});
