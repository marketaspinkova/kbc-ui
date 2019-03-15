import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {
  Alert,
  Col,
  Checkbox,
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ProgressBar,
  HelpBlock,
  ButtonToolbar,
  Button
} from 'react-bootstrap';
import Select from 'react-select';

const INITIAL_STATE = {
  file: null,
  public: false,
  permanent: false,
  tags: [],
  error: null
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    uploadingProgress: PropTypes.number.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Upload a new file</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.error ? (
              this.renderError()
            ) : (
              <div>{this.isSaving() ? this.renderProgress() : this.renderForm()}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button onClick={this.onHide} bsStyle="link">
                Cancel
              </Button>
              <Button onClick={this.handleSubmit} disabled={this.isDisabled()} bsStyle="primary">
                Start upload
              </Button>
              {this.state.error && (
                <Button bsStyle="primary" onClick={this.resetState}>
                  Try again
                </Button>
              )}
            </ButtonToolbar>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderError() {
    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  renderProgress() {
    return (
      <div>
        <p>{this.props.uploadingProgress < 100 ? 'Uploading file...' : 'File was successfully uploaded.'}</p>
        <ProgressBar
          striped
          bsStyle="info"
          now={this.props.uploadingProgress}
          active={this.props.uploadingProgress < 100}
        />
      </div>
    );
  },

  renderForm() {
    return (
      <div>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            File
          </Col>
          <Col sm={9}>
            <FormControl type="file" autoFocus onChange={this.handleFile} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Checkbox checked={this.state.public} onChange={this.handlePublic}>
              Make file public
            </Checkbox>
            <HelpBlock>File URL will be permanent and publicly accessible.</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Checkbox checked={this.state.permanent} onChange={this.handlePermanent}>
              Store permanently
            </Checkbox>
            <HelpBlock>
              File will be deleted after <strong>180 days</strong> otherwise.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Tags
          </Col>
          <Col sm={9}>
            <Select.Creatable
              multi
              deleteRemoves={false}
              placeholder="Enter tags"
              noResultsText=""
              promptTextCreator={() => 'Add tag'}
              value={this.state.tags.map(tag => ({ label: tag, value: tag }))}
              onChange={this.handleTags}
            />
          </Col>
        </FormGroup>
      </div>
    );
  },

  handleFile(event) {
    this.setState({ file: event.target.files[0] });
  },

  handlePublic() {
    this.setState({ public: !this.state.public });
  },

  handlePermanent() {
    this.setState({ permanent: !this.state.permanent });
  },

  handleTags(tags) {
    this.setState({
      tags: tags.map(tag => tag.value)
    });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  handleSubmit(event) {
    event.preventDefault();

    const params = {
      isPublic: this.state.public,
      isPermanent: this.state.permanent,
      tags: this.state.tags
    };

    this.props.onConfirm(this.state.file, params).then(this.onHide, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  isSaving() {
    return this.props.uploadingProgress > 0;
  },

  isDisabled() {
    if (this.isSaving() || this.state.error) {
      return true;
    }

    if (!this.state.file) {
      return true;
    }

    return false;
  }
});
