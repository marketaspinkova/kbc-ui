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
  Checkbox,
  ControlLabel,
  ProgressBar,
  HelpBlock
} from 'react-bootstrap';
import { Loader, PanelWithDetails } from '@keboola/indigo-ui';

const INITIAL_STATE = {
  file: null,
  incremental: false,
  delimiter: ',',
  enclosure: '"',
  error: null
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    progress: PropTypes.number.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Import CSV into table {this.props.table.get('name')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.error ? (
              this.renderError()
            ) : (
              <div>{this.isSaving() ? this.renderProgress() : this.renderForm()}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.onHide}>
              Close
            </Button>
            <Button type="submit" bsStyle="success" onClick={this.onSubmit} disabled={this.isDisabled()}>
              Import
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
            CSV file
          </Col>
          <Col sm={9}>
            <FormControl type="file" autoFocus onChange={this.handleFile} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={9} smOffset={3}>
            <Checkbox checked={this.state.incremental} onChange={this.handleIncremental}>
              Incremental
            </Checkbox>
            <HelpBlock>Data from the CSV file will be appended to the table.</HelpBlock>
          </Col>
        </FormGroup>
        {this.renderAdvancedOptions()}
      </div>
    );
  },

  renderProgress() {
    const progress = this.props.isLoading ? 100 : this.props.progress;

    return (
      <div>
        <p>{progress < 100 ? 'Uploading file...' : 'File was successfully uploaded.'}</p>
        <ProgressBar striped bsStyle="info" now={progress} active={progress < 100} />
        {this.props.isLoading && (
          <p>
            <Loader /> Importing data...
          </p>
        )}
      </div>
    );
  },

  renderAdvancedOptions() {
    return (
      <PanelWithDetails defaultExpanded={false} labelOpen="Show CSV file options" labelCollapse="Hide CSV file options">
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
      </PanelWithDetails>
    );
  },

  renderError() {
    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  handleFile(event) {
    this.setState({
      file: event.target.files[0]
    });
  },

  handleIncremental() {
    this.setState({
      incremental: !this.state.incremental
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

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit(event) {
    event.preventDefault();
    const params = {
      delimiter: this.state.delimiter,
      enclosure: this.state.enclosure,
      incremental: this.state.incremental ? 1 : 0
    };

    return this.props.onSubmit(this.state.file, params).then(this.onHide, this.handleError);
  },

  handleError(message) {
    this.setState({ error: message });
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  isSaving() {
    return this.props.isLoading || this.props.progress > 0;
  },

  isDisabled() {
    if (this.isSaving() || this.state.error) {
      return true;
    }

    if (!this.state.file || !this.state.delimiter || !this.state.enclosure) {
      return true;
    }

    return false;
  }
});
