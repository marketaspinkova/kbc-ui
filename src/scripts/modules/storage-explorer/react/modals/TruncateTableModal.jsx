import React from 'react';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    onConfirm: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    tableId: React.PropTypes.string.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isPending: false
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>
            Truncate table
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you really want to truncate table <strong>{this.props.tableId}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div className="row">
            <div className="col-sm-6 text-left">
              {this.state.isPending && (
                <div style={{ padding: '7px 12px'}}>
                  <Loader />
                </div>
              )}
            </div>
            <div className="col-sm-6">
              <ButtonToolbar>
                <Button onClick={this.props.onHide} bsStyle="link">
                  Cancel
                </Button>
                <Button onClick={this.handleConfirm} bsStyle="danger" disabled={this.state.isPending}>
                  Truncate
                </Button>
              </ButtonToolbar>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  },

  handleConfirm() {
    this.setState({
      isPending: true
    });
    this.props
      .onConfirm()
      .finally(() => {
        this.setState({
          isPending: false
        }, () => {
          this.props.onHide();
        });
      });
  }
});
