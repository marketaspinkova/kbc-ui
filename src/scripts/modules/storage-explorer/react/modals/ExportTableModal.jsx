import React, { PropTypes } from 'react';
import { Alert, Modal, ButtonToolbar, Button, Form } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isExporting: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      file: null,
      url: '',
      error: null
    };
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Export table {this.props.table.get('id')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}

            <p>
              When the export is finished, you will be given link to download the file, it will also appear in Storage
              Files. You can track export progress in Storage Jobs.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              {this.props.isExporting && (
                <span>
                  <Loader />{' '}
                </span>
              )}
              <Button onClick={this.props.onHide} bsStyle="link">
                Cancel
              </Button>
              {this.state.url ? (
                <ExternalLink className="btn btn-primary" href={this.state.url} title={this.state.url}>
                  <i className="fa fa-download" /> Download
                </ExternalLink>
              ) : (
                <Button type="submit" bsStyle="success" disabled={this.props.isExporting}>
                  Export
                </Button>
              )}
            </ButtonToolbar>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit().then(file => {
      this.setState({ url: file.url });
    }, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  }
});