import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal } from 'react-bootstrap';
import { ButtonToolbar, Button } from 'react-bootstrap';
import SqlDepAnalyzerApi from '../../../sqldep-analyzer/Api';
import { ExternalLink } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      isLoading: false,
      sqlDepUrl: null
    };
  },

  onHide() {
    this.setState({
      isLoading: false,
      sqlDepUrl: null
    });
    return this.props.onHide();
  },

  onRun() {
    this.setState({
      isLoading: true
    });
    return SqlDepAnalyzerApi
      .getGraph(this.props.bucketId, this.props.transformationId)
      .then((response) => {
        return this.setState({
          isLoading: false,
          sqlDepUrl: response.url
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
          <Modal.Title>SQLdep</Modal.Title>
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
              disabled={this.state.isLoading || !!this.state.sqlDepUrl || !this.isValidBackend()}
            >
              {this.state.isLoading ? 'Running' : 'Run'}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  renderSqlDepUrl() {
    if (this.state.sqlDepUrl) {
      return (
        <span>
          <p>
            SQLdep is ready at <ExternalLink href={this.state.sqlDepUrl}>{this.state.sqlDepUrl}</ExternalLink>.
          </p>
        </span>
      );
    }
  },
  renderBody() {
    if (this.isValidBackend()) {
      return (
        <span>
          <p>
            Visual SQL analysis will send the SQL queries (including comments) and table details to
            {' '}<ExternalLink href="https://sqldep.com/">SQLdep API</ExternalLink>.
            Although the URL will be only available to you, the result is not secured any further.
          </p>
          {this.renderSqlDepUrl()}
        </span>
      );
    } else {
      return (
        <p>Visual SQL analysis is available for Snowflake and Redshift transformations only.</p>
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
