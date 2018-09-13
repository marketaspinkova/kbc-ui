import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Edit from './QueriesEdit';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';
import {AlertBlock} from '@keboola/indigo-ui';
import {Col, Row} from 'react-bootstrap';


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
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool,
    disabled: PropTypes.bool
  },

  getInitialState: function() {
    // DUMMY STATE
    return {
      errorLineNumber: 1,
      errors: [
        {
          message: 'Unable to proceed with syntax parsing at line 5 column 1. CRETE TABLE "out_table" AS ' +
          'SELEC * FOM "in_table";',
          lineNumber: 2
        },
        {
          message: 'Unable to proceed with syntax parsing at line 5 column 1. CRETE TABLE "out_table" AS ' +
          'SELEC * FOM "in_table";',
          lineNumber: 4
        },
        {
          message: 'Unable to proceed with syntax parsing at line 5 column 1. CRETE TABLE "out_table" AS ' +
          'SELEC * FOM "in_table";',
          lineNumber: 6
        }
      ]
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
        <h2 style={{lineHeight: '32px'}}>
          Queries
          <small>
            <Clipboard text={this.props.queries}/>
          </small>
          {this.renderButtons()}
        </h2>
        {this.state.errors.length > 0 &&
          this.renderValidationAlert()
        }
        {this.queries()}
      </div>
    );
  },

  renderButtons() {
    return (
      <span className="pull-right">
        <SaveButtons
          isSaving={this.props.isSaving}
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

  scrollToError(lineNumber) {
    this.state.errorLineNumber = lineNumber;
    // todo: napojit na highlightQueryNumber
  },

  renderValidationAlert() {
    return (
      <AlertBlock
        type="danger"
        title={'SQL Validation found ' + this.state.errors.length + ' errors'}>
        <Row>
          <Col md={9}>
            <p>
              Your query has been saved, however the script didn't pass validation.
              Ignoring errors will result in failed job, when running transformation.
            </p>
            <p>
              Tables defined in Output Mapping that does not yet exist in Storage are not validated.
            </p>
            <h4>
              Please resolve folowing errors:
            </h4>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <ul className="list-unstyled">
              {this.state.errors.map(
                (error) => (
                  <li>
                    <a onClick={this.scrollToError(error.lineNumber)}>
                      Transformatin ABC at line #{error.lineNumber}
                    </a>
                    <p>{error.message}</p>
                  </li>
                )
              )
              }
            </ul>
          </Col>
        </Row>
      </AlertBlock>
    );
  }
});
