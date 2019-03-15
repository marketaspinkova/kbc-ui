import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Button } from 'react-bootstrap';
import NewComponentModal from '../pages/new-component-form/NewComponentModal';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool
  },

  getInitialState() {
    return { showModal: false };
  },

  getDefaultProps() {
    return { label: 'New Configuration' };
  },

  close() {
    return this.setState({ showModal: false });
  },

  open() {
    return this.setState({ showModal: true });
  },

  render() {
    return (
      <div>
        <Button bsStyle="success" onClick={this.open} disabled={this.props.disabled}>
          <i className="kbc-icon-plus" />
          {this.props.label}
        </Button>
        <Modal show={this.state.showModal} onHide={this.close} className="modal-configuration">
          <NewComponentModal component={this.props.component} onClose={this.close} />
        </Modal>
      </div>
    );
  }
});
