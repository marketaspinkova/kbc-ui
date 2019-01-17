import React, { PropTypes } from 'react';
import { fromJS } from 'immutable';
import { Alert, Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import SqlDepAnalyzerApi from '../../../sqldep-analyzer/Api';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Result from '../components/validation/Result';

const INITIAL_STATE = {
  isLoading: false,
  result: null
};

export default React.createClass({
  propTypes: {
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaved: PropTypes.bool.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Validate SQL</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderBody()}</Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.state.isLoading}
            isDisabled={this.state.isLoading || !!this.state.result || !this.isValidBackend()}
            saveLabel="Validate"
            saveStyle="primary"
            onCancel={this.onHide}
            onSave={this.onRun}
            saveButtonType="submit"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderBody() {
    if (this.isValidBackend()) {
      return (
        <span>
          <p>
            SQL validation will send the SQL queries (including comments) and table details to{' '}
            <ExternalLink href="https://sqldep.com/">SQLdep API</ExternalLink>. Results will be immediately removed from
            their API after presenting to you.
          </p>
          <p>Tables defined in output mapping that does not yet exist in Storage are not validated.</p>
          {this.renderNotSavedWarning()}
          {this.renderResult()}
        </span>
      );
    }

    return <p>SQL validation is available for Snowflake transformations only.</p>;
  },

  renderNotSavedWarning() {
    if (this.props.isSaved) {
      return null;
    }

    return <Alert bsStyle="warning">You have unsaved changes. Validation will only apply to the last version.</Alert>;
  },

  renderResult() {
    if (!this.state.result) {
      return null;
    }

    return (
      <span style={{ maxHeight: '300px', overflow: 'scroll' }}>
        <Result result={this.state.result} bucketId={this.props.bucketId} onRedirect={this.onHide} />
      </span>
    );
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  onRun() {
    this.setState({ isLoading: true });
    return SqlDepAnalyzerApi.validate(this.props.bucketId, this.props.transformationId)
      .then(response => {
        return this.setState({
          isLoading: false,
          result: fromJS(response)
        });
      })
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  },

  isValidBackend() {
    return ['redshift', 'snowflake'].includes(this.props.backend);
  }
});
