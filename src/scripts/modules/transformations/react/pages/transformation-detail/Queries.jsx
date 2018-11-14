import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { fromJS, Map } from 'immutable';
import SqlDepAnalyzerApi from '../../../../sqldep-analyzer/Api';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import Edit from './QueriesEdit';
import Result from '../../components/validation/Result';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';
import sqlValidationErrors from '../../../../components/react/components/notifications/sqlValidationErrors';
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

  componentDidMount() {
    this.validateQueries();
  },

  componentDidUpdate(prevProps) {
    if (this.canBeValidated(prevProps.transformation)) {
      this.validateQueries();
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
          {this.renderButtons()}
        </h2>
        {this.renderValidation()}
        {this.renderQueries()}
      </div>
    );
  },

  renderButtons() {
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

  renderQueries() {
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

  renderValidation() {
    if (!this.state.errors.count()) {
      return null;
    }

    return (
      <div id="sql-queries-block">
        <AlertBlock type="danger" title={this.validationErrorMessage(this.state.errors)}>
          <Row>
            <Col md={9}>
              <p>Queries haven't passed the validation. Ignoring errors may result in a failed job.</p>
              <h4>
                Please resolve folowing error
                {this.state.errors.count() > 1 ? 's' : ''}:
              </h4>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              {this.state.errors.map(error => (
                <Result
                  error={error}
                  bucketId={this.props.bucketId}
                  onErrorMessageClick={this.handleErrorMessageClick}
                />
              ))}
              <span>
                Not an error? Please <a onClick={() => contactSupport({ type: 'project' })}>contact us</a>.
              </span>
            </Col>
          </Row>
        </AlertBlock>
      </div>
    );
  },

  handleErrorMessageClick(lineNumber) {
    this.setState({
      highlightQueryNumber: lineNumber
    });
  },

  validateQueries() {
    this.setState({
      highlightQueryNumber: null,
      validationRunning: true,
      errors: Map()
    });

    return SqlDepAnalyzerApi.validate(this.props.bucketId, this.props.transformation.get('id'))
      .then(response => {
        const errors = fromJS(response).filter(error => error.get('transformation') !== 'undefined');

        if (errors.count()) {
          ApplicationActionCreators.sendNotification({
            message: sqlValidationErrors(
              this.props.bucketId,
              this.props.transformation.get('id'),
              errors.count(),
              () => {
                const sqlBlock = document.getElementById('sql-queries-block');

                if (sqlBlock) {
                  sqlBlock.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }
            ),
            type: 'error'
          });
        }

        this.setState({
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

  validationErrorMessage(errors) {
    return 'SQL Validation found ' + errors.count() + ' error' + (errors.count() > 1 ? 's.' : '.');
  },

  canBeValidated(transformation) {
    return (
      this.props.transformation.get('backend') === 'snowflake' && !this.props.transformation.equals(transformation)
    );
  }
});
