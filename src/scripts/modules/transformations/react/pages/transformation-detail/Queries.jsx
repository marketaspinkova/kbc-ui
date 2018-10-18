import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { fromJS, Map } from 'immutable';
import SqlDepAnalyzerApi from '../../../../sqldep-analyzer/Api';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import Edit from './QueriesEdit';
import Result from '../../components/validation/Result';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';
import { AlertBlock } from '@keboola/indigo-ui';
import { Col, Row } from 'react-bootstrap';
import contactSupport from '../../../../../utils/contactSupport';

/* global require */
require('codemirror/mode/sql/sql');

export default React.createClass({
  mixins: [PureRenderMixin],

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
    disabled: PropTypes.bool
  },

  getInitialState() {
    return {
      highlightQueryNumber: null,
      validationRunning: false,
      errors: Map()
    };
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  componentDidUpdate(prevProps) {
    if (this._canBeValidated(prevProps.transformation)) {
      this._validateQueries();
    }
  },

  render() {
    return (
      <div>
        <h2 style={{ lineHeight: '32px' }}>
          Queries
          <small>
            <Clipboard text={this.props.queries} />
          </small>
          {this._renderButtons()}
        </h2>
        {this._renderValidation()}
        {this._renderQueries()}
      </div>
    );
  },

  _renderButtons() {
    return (
      <span className="pull-right">
        <SaveButtons
          isSaving={this.props.isSaving || this.state.validationRunning}
          disabled={this.props.isQueriesProcessing || this.props.disabled}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
        />
      </span>
    );
  },

  _renderQueries() {
    return (
      <Edit
        queries={this.props.queries}
        splitQueries={this.props.splitQueries}
        backend={this.props.transformation.get('backend')}
        disabled={this.props.isSaving || this.props.disabled}
        onChange={this.props.onEditChange}
        highlightQueryNumber={this.state.highlightQueryNumber}
      />
    );
  },

  _renderValidation() {
    if (!this.state.errors.count()) {
      return null;
    }

    return (
      <AlertBlock type="danger" title={this._validationErrorMessage(this.state.errors)}>
        <Row>
          <Col md={9}>
            <p>
              Your query has been saved, however the script didn't pass validation. Ignoring errors will result in
              failed job, when running transformation.
            </p>
            <p>Tables defined in Output Mapping that does not yet exist in Storage are not validated.</p>
            <h4>
              Please resolve folowing error
              {this.state.errors.count() > 1 ? 's' : ''}:
            </h4>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <ul className="list-unstyled">
              {this.state.errors.map((error, index) => (
                <li key={index}>
                  <Result
                    error={error}
                    bucketId={this.props.bucketId}
                    onErrorMessageClick={this._handleErrorMessageClick}
                  />
                </li>
              ))}
              <li key={this.state.errors.count() + 1}>
                <p>
                  <b>Not an error?</b> Please <a onClick={() => contactSupport({ type: 'project' })}>contact us</a>.
                </p>
              </li>
            </ul>
          </Col>
        </Row>
      </AlertBlock>
    );
  },

  _handleErrorMessageClick(lineNumber) {
    this.setState({
      highlightQueryNumber: lineNumber
    });
  },

  _validateQueries() {
    this.setState({
      validationRunning: true
    });

    return SqlDepAnalyzerApi.validate(this.props.bucketId, this.props.transformation.get('id'))
      .then(response => {
        const errors = fromJS(response);

        if (errors.count()) {
          ApplicationActionCreators.sendNotification({
            message: this._validationErrorMessage(errors),
            type: 'error'
          });
        } else {
          this.setState({
            highlightQueryNumber: null
          });
        }

        return this.setState({
          validationRunning: false,
          errors: errors
        });
      })
      .catch(error => {
        this.setState({
          validationRunning: false
        });
        throw error;
      });
  },

  _validationErrorMessage(errors) {
    return 'SQL Validation found ' + errors.count() + ' error' + (errors.count() > 1 ? 's.' : '.');
  },

  _canBeValidated(transformation) {
    return (
      this.props.transformation.get('backend') === 'snowflake' && !this.props.transformation.equals(transformation)
    );
  }
});
