import PropTypes from 'prop-types';
import React from 'react';
import { fromJS } from 'immutable';
import { Alert, Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import SqlDepAnalyzerApi from '../../../sqldep-analyzer/Api';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Result from '../components/validation/Result';

const INITIAL_STATE = {
  isLoading: false,
  isValid: false,
  isRunning: false,
  result: null
};

export default React.createClass({
  propTypes: {
    backend: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
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
            isSaving={this.state.isLoading || this.state.isRunning}
            isDisabled={this.isDisabled()}
            onCancel={this.onHide}
            onSave={this.isEligibleToRun() ? this.onRunTransformation : this.onRunValidation}
            saveLabel={this.isEligibleToRun() ? 'Run transformation' : 'Validate'}
            saveStyle="primary"
            saveButtonType="submit"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  isEligibleToRun() {
    return this.state.isValid && !this.props.transformation.get('disabled');
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
    this.setState(INITIAL_STATE, this.props.onHide);
  },

  onRunTransformation() {
    this.setState({
      isRunning: true
    });
    InstalledComponentsActionCreators
      .runComponent({
        component: 'transformation',
        data: {
          configBucketId: this.props.bucketId,
          transformations: [this.props.transformation.get('id')]
        }
      })
      .finally(this.onHide);
  },

  onRunValidation() {
    this.setState({ isLoading: true });
    return SqlDepAnalyzerApi.validate(this.props.bucketId, this.props.transformation.get('id'))
      .then(response => {
        const result = fromJS(response);
        return this.setState({
          isLoading: false,
          isValid: result.count() === 0,
          result
        });
      })
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  },

  isDisabled() {
    if (this.state.isLoading || !this.isValidBackend()) {
      return true;
    }

    if (this.state.result && (!this.state.isValid || this.props.transformation.get('disabled'))) {
      return true;
    }

    return false;
  },

  isValidBackend() {
    return ['redshift', 'snowflake'].includes(this.props.backend);
  }
});
