import React from 'react';
import { Modal } from 'react-bootstrap';
import { ButtonToolbar, Button } from 'react-bootstrap';
import SqlDepAnalyzerApi from '../../../sqldep-analyzer/Api';
import { ExternalLink } from '@keboola/indigo-ui';
import Result from '../components/validation/Result';
import Immutable from 'immutable';

export default React.createClass({
  propTypes: {
    transformationId: React.PropTypes.string.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    backend: React.PropTypes.string.isRequired,
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    isSaved: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isLoading: false,
      result: null
    };
  },

  onHide() {
    this.setState({
      isLoading: false,
      result: null
    });
    return this.props.onHide();
  },

  onRun() {
    this.setState({
      isLoading: true
    });
    return SqlDepAnalyzerApi
      .validate(this.props.bucketId, this.props.transformationId)
      .then((response) => {
        return this.setState({
          isLoading: false,
          result: Immutable.fromJS(response)
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false
        });
        throw error;
      });
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.onHide}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Validate SQL</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={this.onHide} bsStyle="link">Close</Button>
            <Button
              onClick={this.onRun}
              className="btn-primary"
              disabled={this.state.isLoading || !!this.state.result || !this.isValidBackend()}
            >
              {this.state.isLoading ? 'Running' : 'Run'}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  renderResult() {
    if (!this.state.result) {
      return;
    }
    return (
      <Result
        result={this.state.result}
        bucketId={this.props.bucketId}
        onRedirect={this.onHide}
      />
    );
  },

  renderNotSavedWarning() {
    if (!this.props.isSaved) {
      return (
        <p className="alert alert-warning">You have unsaved changes. Validation will only apply to the last version.</p>
      );
    }
  },

  renderBody() {
    if (this.isValidBackend()) {
      return (
        <span>
          <p>
            SQL validation will send the SQL queries (including comments) and table details to
            {' '}<ExternalLink href="https://sqldep.com/">SQLdep API</ExternalLink>.
            Results will be immediately removed from their API after presenting to you.
          </p>
          <p>
            Tables defined in output mapping that does not yet exist in Storage are not validated.
          </p>
          {this.renderNotSavedWarning()}
          <span style={{maxHeight: '300px', overflow: 'scroll'}}>
            {this.renderResult()}
          </span>
        </span>
      );
    } else {
      return (
        <p>SQL validation is available for Snowflake transformations only.</p>
      );
    }
  },

  isValidBackend() {
    if (this.props.backend === 'redshift' || this.props.backend === 'snowflake') {
      return true;
    }
    return false;
  }
});
