import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import CreateDockerSandboxForm from '../components/CreateDockerSandboxForm';

export default React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    close: React.PropTypes.func.isRequired,
    create: React.PropTypes.func.isRequired,
    tables: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    onConfigurationChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool
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

