import React, { PropTypes } from 'react';
import {
  Alert,
  Button,
  Col,
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ProgressBar,
  HelpBlock
} from 'react-bootstrap';
import { Loader, PanelWithDetails } from '@keboola/indigo-ui';

const INITIAL_PROGRESS = {
  upload: {
    value: 0,
    active: false
  },
  create: {
    value: 0,
    active: false
  }
};

const INITIAL_STATE = {
  name: '',
  delimiter: ',',
  enclosure: '"',
  tableColumns: '',
  primaryKey: '',
  createFrom: 'csv',
  progress: INITIAL_PROGRESS,
  error: null
};

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    openModal: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.openModal} onHide={this.onHide}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create table in {this.props.bucket.get('id')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.error ? this.renderError() : this.renderForm()}</Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.onHide}>
              Close
            </Button>
            <Button type="submit" bsStyle="success" onClick={this.onSubmit} disabled={this.isDisabled()}>
              Create
            </Button>
            {this.state.error && (
              <Button bsStyle="primary" onClick={this.resetState}>
                Try again
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderForm() {
    if (this.props.isSaving) {
      const { progress } = this.state;

      return (
        <div>
          <p>
            <Loader /> {progress.upload.active ? 'Uploading data...' : 'Creating table...'}
          </p>
          <ProgressBar>
            <ProgressBar
              striped
              bsStyle="info"
              now={progress.upload.value / 2}
              label={`${progress.upload.value}%`}
              active={progress.upload.active}
            />
            <ProgressBar
              striped
              bsStyle="success"
              now={progress.create.value / 2}
              label={`${progress.create.value}%`}
              active={progress.create.active}
            />
          </ProgressBar>
        </div>
      );
    }

    return (
      <div>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Name
          </Col>
          <Col sm={9}>
            <FormControl type="text" value={this.state.name} onChange={this.handleName} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Create from
          </Col>
          <Col sm={9}>
            <FormControl componentClass="select" value={this.state.createFrom} onChange={this.handleCreateFrom}>
              <option value="csv">CSV file upload</option>
              <option value="text">Text input</option>
            </FormControl>
          </Col>
        </FormGroup>

        {this.state.createFrom === 'csv' ? this.renderCreateFromCSV() : this.renderCreateFromTextInput()}

        {this.renderAdvancedOptions()}
      </div>
    );
  },

  renderCreateFromCSV() {
    return (
      <div>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Delimiter
          </Col>
          <Col sm={9}>
            <FormControl type="text" value={this.state.delimiter} onChange={this.handleDelimiter} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Enclosure
          </Col>
          <Col sm={9}>
            <FormControl type="text" value={this.state.enclosure} onChange={this.handleEnclosure} />
          </Col>
        </FormGroup>
      </div>
    );
  },

  renderCreateFromTextInput() {
    return (
      <FormGroup>
        <Col sm={3} componentClass={ControlLabel}>
          Table columns
        </Col>
        <Col sm={9}>
          <FormControl type="text" value={this.state.tableColumns} onChange={this.handleTableColumns} />
          <HelpBlock>Please enter names of columns separated by comma.</HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  renderAdvancedOptions() {
    return (
      <PanelWithDetails defaultExpanded={false} labelOpen="Show advanced options" labelCollapse="Hide advanced options">
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Primary key
          </Col>
          <Col sm={9}>
            <FormControl
              type="text"
              placeholder="Primary key column name"
              value={this.state.primaryKey}
              onChange={this.handlePrimaryKey}
            />
            <HelpBlock>
              Primay key is useful for incremental imports - rows that already exists in table are updated.
            </HelpBlock>
          </Col>
        </FormGroup>
      </PanelWithDetails>
    );
  },

  renderError() {
    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  handleName(event) {
    this.setState({
      name: event.target.value
    });
  },

  handleCreateFrom(event) {
    this.setState({
      createFrom: event.target.value
    });
  },

  handleDelimiter(event) {
    this.setState({
      delimiter: event.target.value
    });
  },

  handleEnclosure(event) {
    this.setState({
      enclosure: event.target.value
    });
  },

  handleTableColumns(event) {
    this.setState({
      tableColumns: event.target.value
    });
  },

  handlePrimaryKey(event) {
    this.setState({
      primaryKey: event.target.value
    });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit(event) {
    event.preventDefault();
    const params = {};

    this.props.onSubmit(params).then(this.onHide, message => {
      this.setState({
        error: message
      });
    });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  resetProgress() {
    this.setState({
      progress: INITIAL_PROGRESS
    });
  },

  onUploadProgress(progress) {
    const complete = progress.percentComplete;

    this.setState({
      progress: {
        ...this.state.progress,
        upload: {
          value: complete,
          active: complete > 0 && complete < 100
        }
      }
    });
  },

  isDisabled() {
    return this.props.isSaving || this.state.error;
  }
});
