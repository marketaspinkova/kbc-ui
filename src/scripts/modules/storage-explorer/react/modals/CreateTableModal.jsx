import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
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
import Select from 'react-select';

const CREATE_TABLE_FROM_CSV_FILE = 'csv';
const CREATE_TABLE_FROM_TEXT = 'text';

const INITIAL_STATE = {
  name: '',
  file: null,
  delimiter: ',',
  enclosure: '"',
  tableColumns: [],
  primaryKey: '',
  createFrom: CREATE_TABLE_FROM_CSV_FILE,
  error: null,
  warning: null
};

export default createReactClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
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
            {this.renderError()}
            {this.renderWarning()}

            {!this.state.error && (
              <div>{this.isSaving() ? this.renderProgress() : this.renderForm()}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.onHide}>
              Close
            </Button>
            <Button
              type="submit"
              bsStyle="success"
              onClick={this.onSubmit}
              disabled={this.isDisabled()}
            >
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
            <FormControl
              autoFocus
              type="text"
              value={this.state.name}
              onChange={this.handleName}
            />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Create from
          </Col>
          <Col sm={9}>
            <FormControl
              componentClass="select"
              value={this.state.createFrom}
              onChange={this.handleCreateFrom}
            >
              <option value={CREATE_TABLE_FROM_CSV_FILE}>CSV file upload</option>
              <option value={CREATE_TABLE_FROM_TEXT}>Text input</option>
            </FormControl>
          </Col>
        </FormGroup>

        {this.state.createFrom === CREATE_TABLE_FROM_CSV_FILE
          ? this.renderCreateFromCsv()
          : this.renderCreateFromTextInput()}

        {this.renderAdvancedOptions()}
      </div>
    );
  },

  renderProgress() {
    if (this.state.createFrom === CREATE_TABLE_FROM_TEXT) {
      return (
        <p>
          <Loader /> Creating table...
        </p>
      );
    }

    const progress = this.props.isCreatingTable ? 100 : this.props.progress;

    return (
      <div>
        <p>{progress < 100 ? 'Uploading file...' : 'File was successfully uploaded'}</p>
        <ProgressBar striped bsStyle="info" now={progress} active={progress < 100} />
        {this.props.isCreatingTable && (
          <p>
            <Loader /> Creating table...
          </p>
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
            <HelpBlock>Table structure will be set up from the CSV file.</HelpBlock>
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
          <Select.Creatable
            multi
            deleteRemoves={false}
            placeholder="Add columns..."
            noResultsText=""
            promptTextCreator={(column) => `Add column ${column}`}
            value={this.state.tableColumns}
            onChange={this.handleTableColumns}
          />
        </Col>
      </FormGroup>
    );
  },

  renderAdvancedOptions() {
    return (
      <PanelWithDetails
        defaultExpanded={false}
        labelOpen="Show advanced options"
        labelCollapse="Hide advanced options"
      >
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
              Primary key is useful for incremental imports - rows that already exist in the table are
              updated.
            </HelpBlock>
          </Col>
        </FormGroup>
      </PanelWithDetails>
    );
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  renderWarning() {
    if (!this.state.warning) {
      return null;
    }

    return <Alert bsStyle="warning">{this.state.warning}</Alert>;
  },

  handleName(event) {
    this.setState({ name: event.target.value }, this.validateName);
  },

  handleCreateFrom(event) {
    this.setState({ createFrom: event.target.value });
  },

  handleFile(event) {
    this.setState({ file: event.target.files[0] });
  },

  handleDelimiter(event) {
    this.setState({ delimiter: event.target.value });
  },

  handleEnclosure(event) {
    this.setState({ enclosure: event.target.value });
  },

  handleTableColumns(columns) {
    this.setState({ tableColumns: columns });
  },

  handlePrimaryKey(event) {
    this.setState({ primaryKey: event.target.value });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit(event) {
    event.preventDefault();

    if (this.state.createFrom === CREATE_TABLE_FROM_CSV_FILE) {
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

    return this.props.onCreateFromCsv(this.state.file, params).then(this.onHide, this.handleError);
  },

  createTableFromString() {
    const params = {
      name: this.state.name,
      dataString: this.state.tableColumns.map((column) => column.value).join(',')
    };

    if (this.state.primaryKey) {
      params.primaryKey = this.state.primaryKey;
    }

    return this.props.onCreateFromString(params).then(this.onHide, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  validateName() {
    if (!/^[a-zA-Z0-9_-]*$/.test(this.state.name)) {
      this.setState({
        warning: 'Only alphanumeric characters, dash, and underscores are allowed in the table name.'
      });
    } else if (this.state.name.length > 64) {
      this.setState({
        warning: 'The maximum allowed table name length is 64 characters.'
      });
    } else if (this.state.name.indexOf('_') === 0) {
      this.setState({
        warning: `Table name cannot start with an underscore.`
      });
    } else if (this.tableExists()) {
      this.setState({
        warning: `The table ${this.state.name} already exists.`
      });
    } else {
      this.setState({ warning: null });
    }
  },

  tableExists() {
    return !!this.props.tables.find((table) => table.get('name') === this.state.name);
  },

  isSaving() {
    return this.props.isCreatingTable || this.props.progress > 0;
  },

  isDisabled() {
    if (!this.state.name || this.isSaving() || this.state.error) {
      return true;
    }

    if (this.state.createFrom === CREATE_TABLE_FROM_CSV_FILE) {
      if (!this.state.file || !this.state.delimiter || !this.state.enclosure) {
        return true;
      }
    } else if (!this.state.tableColumns.length) {
      return true;
    }

    return false;
  }
});
