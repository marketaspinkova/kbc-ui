import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, FormGroup, Checkbox } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TableAliasesAndLinks from '../components/TableAliasesAndLinks';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
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

              <TableAliasesAndLinks
                sapiToken={this.props.sapiToken}
                urlTemplates={this.props.urlTemplates}
                tableAliases={this.props.tableAliases}
                tableLinks={this.props.tableLinks}
                onLinkClick={this.props.onHide}
              />
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
