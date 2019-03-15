import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Table, Alert} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';
import EmptyState from '../../../../components/react/components/ComponentEmptyState';

export default createReactClass({
  propTypes: {
    sampleDataInfo: PropTypes.object.isRequired,
    onRunQuery: PropTypes.func.isRequired,
    isQueryValid: PropTypes.bool,
  },

  getSampleDataInfo(key, defaultValue) {
    return this.props.sampleDataInfo.getIn([].concat(key), defaultValue);
  },

  getInitialState() {
    return {
      showIds: false
    };
  },

  render() {
    return (
      <div>
        {this.renderRunButton()}
        {this.renderSamplesTable()}
      </div>
    );
  },

  renderSamplesTable() {
    const sampleData = this.getSampleDataInfo('data', null);
    if (!sampleData ) {
      return null;
    }
    if (sampleData.count() === 0) {
      return (
        <EmptyState>
          Query returned empty result
        </EmptyState>
      );
    }

    return (
      <Table responsive className="table table-striped">
        <thead>
          <tr>
            {this.renderHeader(sampleData.first())}
          </tr>
        </thead>
        <tbody>
          {this.renderRows(sampleData)}
        </tbody>
      </Table>
    );
  },

  renderHeader(firstRow) {
    return firstRow.map((value, columnName) => {
      return (
        <th key={columnName}>
          {columnName}
          {columnName === 'id' && (
            <button
              style={{paddingLeft: '2px', paddingBottom: 0, paddingTop: 0}}
              onClick={() => this.setState({showIds: !this.state.showIds})}
              className="btn btn-link btn-sm"
            >
              {this.state.showIds ? 'Hide' : 'Show'}
            </button>
          )}
        </th>
      );
    }).toArray();
  },

  renderRows(rows) {
    return rows.map((row, rowIndex) => {
      return (
        <tr key={rowIndex}>
          {row.map((value, columnName) => {
            return (
              <td key={columnName}>
                {(columnName === 'id' && !this.state.showIds) ? '...' : value}
              </td>
            );
          }).toArray()}
        </tr>);
    }).toArray();
  },

  renderError(error) {
    let message = error.get('message');
    const code = error.get('code');
    if (code < 500) {
      try {
        message = JSON.parse(message).message || message;
      } catch (e) {
        message = error.get('message');
      }
    }
    return (
      <Alert bsStyle="danger">
        <p>{message}</p>
        {code >= 500 ? <div>{error.get('exceptionId')}</div> : null}
      </Alert>
    );
  },

  renderRunButton() {
    const isLoading = this.getSampleDataInfo('isLoading', false);
    const isError = this.getSampleDataInfo('isError', false);
    const error = this.getSampleDataInfo('error');

    return (
      <div className="text-center">
        <button
          className="btn btn-primary"
          type="button"
          disabled={isLoading || !this.props.isQueryValid}
          onClick={this.props.onRunQuery}
        >
          Test Query
          {' '}
          {isLoading ? <Loader /> : null}
        </button>
        {isError ?
          this.renderError(error)
          : null}
      </div>
    );
  }
});
