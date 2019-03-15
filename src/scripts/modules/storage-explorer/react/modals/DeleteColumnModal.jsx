import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Form, Modal, Checkbox } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TableAliasesAndLinks from '../components/TableAliasesAndLinks';

const INITIAL_STATE = {
  forceDelete: false
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    column: PropTypes.string.isRequired,
    tableAliases: PropTypes.array.isRequired,
    tableLinks: PropTypes.array.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit}>
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
              isSaving={false}
              isDisabled={this.isDisabled()}
              onSave={this.handleSubmit}
              onCancel={this.onHide}
              saveLabel="Delete"
              saveStyle="danger"
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  toggleForceDelete() {
    this.setState({
      forceDelete: !this.state.forceDelete
    });
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.props.column, this.state.forceDelete);
    this.onHide();
  },

  isDisabled() {
    if (this.hasAliasesOrLinks() && !this.state.forceDelete) {
      return true;
    }

    return false;
  },

  hasAliasesOrLinks() {
    return this.props.tableAliases.length > 0 || this.props.tableLinks.length > 0;
  }
});
