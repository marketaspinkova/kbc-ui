import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Button, Modal} from 'react-bootstrap';
import CreateDockerSandboxForm from '../components/CreateDockerSandboxForm';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    tables: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onConfigurationChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      disabled: false
    };
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.props.close} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Create {this.props.type} Sandbox</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateDockerSandboxForm
            tables={this.props.tables}
            type={this.props.type}
            onChange={this.props.onConfigurationChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.close} bsStyle="link">Close</Button>
          <Button onClick={this.create} bsStyle="success" disabled={this.props.disabled}>Create Sandbox</Button>
        </Modal.Footer>
      </Modal>
    );
  },
  create: function() {
    this.props.create();
    this.props.close();
  }
});

