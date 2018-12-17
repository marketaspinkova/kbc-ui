import React, { PropTypes } from 'react';
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
import { Loader } from '@keboola/indigo-ui';
import Select from 'react-select';

const INITIAL_STATE = {
  file: null,
  public: false,
  permanent: false,
  tags: [],
  error: null
};

export default React.createClass({
  propTypes: {
    uploading: PropTypes.bool.isRequired,
    progress: PropTypes.number.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal onHide={this.onHide} show={true}>
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
        <ProgressBar striped bsStyle="info" now={this.props.progress} active={this.props.progress < 100} />
        {this.props.progress < 100 ? (
          <p>
            <Loader /> Uploading file...
          </p>
        ) : (
          <p>File was successfully uploaded.</p>
        )}
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
            <FormControl type="file" onChange={this.handleFile} />
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
              backspaceRemoves={false}
              deleteRemoves={false}
              placeholder="Enter tags"
              noResultsText=""
              promptTextCreator={() => 'Add tag'}
              value={this.state.tags.map(tag => ({ label: tag, value: tag }))}
              onChange={this.handleTags}
              options={[]}
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

    this.props.onConfirm().then(() => {}, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  isSaving() {
    return this.props.uploading || this.props.progress > 0;
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
