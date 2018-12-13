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

const INITIAL_STATE = {
  name: '',
  file: null,
  delimiter: ',',
  enclosure: '"',
  tableColumns: '',
  primaryKey: '',
  createFrom: 'csv',
  error: null
};

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    openModal: PropTypes.bool.isRequired,
    onCreateFromCsv: PropTypes.func.isRequired,
    onCreateFromString: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isCreatingTable: PropTypes.bool.isRequired,
    progress: PropTypes.number.isRequired
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
          <Modal.Body>
            {this.state.error && this.renderError()}
            {this.isSaving() ? this.renderProgress() : this.renderForm()}
          </Modal.Body>
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

        {/* <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Create from
          </Col>
          <Col sm={9}>
            <FormControl componentClass="select" value={this.state.createFrom} onChange={this.handleCreateFrom}>
              <option value="csv">CSV file upload</option>
              <option value="text">Text input</option>
            </FormControl>
          </Col>
        </FormGroup> */}

        {this.state.createFrom === 'csv' ? this.renderCreateFromCsv() : this.renderCreateFromTextInput()}

        {this.renderAdvancedOptions()}
      </div>
    );
  },

  renderProgress() {
    const progress = this.props.isCreatingTable ? 100 : this.props.progress;

    return (
      <div>
        <ProgressBar striped bsStyle="info" now={progress} active={progress < 100} />
        {progress < 100 ? (
          <p>
            <Loader /> Uploading data...
          </p>
        ) : (
          <div>
            <p>File was successfully uploaded.</p>
            <p>
              <Loader /> Creating table...
            </p>
          </div>
        )}
      </div>
    );
  },

  renderCreateFromCsv() {
    return (
      <div>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            CSV file
          </Col>
          <Col sm={9}>
            <FormControl type="file" onChange={this.handleFile} />
            <HelpBlock>Table structure will be setup from CSV file.</HelpBlock>
          </Col>
        </FormGroup>
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

  handleFile(event) {
    this.setState({
      file: event.target.files[0]
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

    if (this.state.createFrom === 'csv') {
      return this.createTableFromCsv();
    }

    return this.createTableFromString();
  },

  createTableFromCsv() {
    const params = {
      name: this.state.name,
      delimiter: this.state.delimiter,
      enclosure: this.state.enclosure
    };

    if (this.state.primaryKey) {
      params.primaryKey = this.state.primaryKey;
    }

    return this.props.onCreateFromCsv(this.state.file, params).then(this.onHide, message => {
      this.setState({ error: message });
    });
  },

  createTableFromString() {
    const params = {
      name: this.state.name,
      data: this.state.tableColumns
    };

    if (this.state.primaryKey) {
      params.primaryKey = this.state.primaryKey;
    }

    return this.props.onCreateFromString(params).then(this.onHide, message => {
      this.setState({ error: message });
    });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  isSaving() {
    return this.props.isCreatingTable || this.props.progress > 0;
  },

  isDisabled() {
    if (!this.state.name || this.isSaving() || this.state.error) {
      return true;
    }

    if (this.state.createFrom === 'csv') {
      if (!this.state.file || !this.state.delimiter || !this.state.enclosure) {
        return true;
      }
    } else if (!this.state.tableColumns) {
      return true;
    }

    return false;
  }
});
