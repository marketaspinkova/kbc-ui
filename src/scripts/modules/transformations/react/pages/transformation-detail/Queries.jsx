import React, { PropTypes } from 'react';
import { fromJS, Map } from 'immutable';
import SqlDepAnalyzerApi from '../../../../sqldep-analyzer/Api';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import Edit from './QueriesEdit';
import ValidationError from '../../components/validation/Result';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';
import { AlertBlock } from '@keboola/indigo-ui';
import { Col, Row } from 'react-bootstrap';
import actionCreators from '../../../ActionCreators';

/* global require */
require('codemirror/mode/sql/sql');

export default React.createClass({
  propTypes: {
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isQueriesProcessing: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    validatableQueries: PropTypes.object,
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool,
    disabled: PropTypes.bool
  },

  getInitialState() {
    return {
      isValidation: false,
      errors: Map()
    };
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  render() {
    return (
      <div>
        {this.props.validatableQueries && <button onClick={this.validateQueries}>Validate</button>}

        <h2 style={{ lineHeight: '32px' }}>
          Queries
          <small>
            <Clipboard text={this.props.queries} />
          </small>
          {this.renderButtons()}
        </h2>
        {this.validation()}
        {this.queries()}
      </div>
    );
  },

  renderButtons() {
    return (
      <span className="pull-right">
        <SaveButtons
          isSaving={this.props.isSaving || this.state.isValidation}
          disabled={this.props.isQueriesProcessing || this.props.disabled}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
        />
      </span>
    );
  },

  queries() {
    return (
      <Edit
        queries={this.props.queries}
        splitQueries={this.props.splitQueries}
        backend={this.props.transformation.get('backend')}
        disabled={this.props.isSaving || this.props.disabled}
        onChange={this.props.onEditChange}
        highlightQueryNumber={this.props.highlightQueryNumber}
        highlightingQueryDisabled={this.props.highlightingQueryDisabled}
      />
    );
  },

  validation() {
    if (!this.state.errors.count()) {
      return null;
    }

    return (
      <AlertBlock type="danger" title={this.validationErrorMessage(this.state.errors)}>
        <Row>
          <Col md={9}>
            <p>
              Your query has been saved, however the script didn't pass validation. Ignoring errors will result in
              failed job, when running transformation.
            </p>
            <p>Tables defined in Output Mapping that does not yet exist in Storage are not validated.</p>
            <h4>Please resolve folowing errors:</h4>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <ul className="list-unstyled">
              {this.state.errors.map((error, index) => (
                <li key={index}>
                  <ValidationError error={error} bucketId={this.props.bucketId} />
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </AlertBlock>
    );
  },

  validateQueries() {
    actionCreators.queryValidationStart(this.props.bucketId, this.props.transformation.get('id'));

    this.setState({
      isValidation: true
    });

    return SqlDepAnalyzerApi.validate(this.props.bucketId, this.props.transformation.get('id'))
      .then(response => {
        const errors = fromJS(response);

        if (errors.count()) {
          ApplicationActionCreators.sendNotification({
            message: this.validationErrorMessage(errors),
            type: 'error'
          });
        }

        return this.setState({
          isValidation: false,
          errors: errors
        });
      })
      .catch(error => {
        this.setState({
          isValidation: false
        });
        throw error;
      });
  },

  validationErrorMessage(errors) {
    return 'SQL Validation found ' + errors.count() + ' error' + (errors.count() > 1 ? 's.' : '.');
  }
});
