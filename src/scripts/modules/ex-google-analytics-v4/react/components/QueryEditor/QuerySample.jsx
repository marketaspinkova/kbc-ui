import React, {PropTypes} from 'react';
// import EmptyState from '../../../../components/react/components/ComponentEmptyState';
import {Table} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';
import EmptyState from '../../../../components/react/components/ComponentEmptyState';

export default React.createClass({
  propTypes: {
    sampleDataInfo: PropTypes.object.isRequired,
    onRunQuery: PropTypes.func.isRequired,
    isQueryValid: PropTypes.bool
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
    const csvMap = this.getSampleDataInfo('data', null);
    if (!csvMap ) {
      return null;
    }
    if (csvMap.count() === 0) {
      return (
        <EmptyState>
          Query returned empty result
        </EmptyState>
      );
    }

    let idIdx = 0;
    const header = csvMap.first().map((c, idx) => {
      if (c === 'id') idIdx = idx;
      return (
        <th>
          {c}
          {c === 'id' ?
            <button style={{paddingLeft: '2px', paddingBottom: 0, paddingTop: 0}}
              onClick={() => this.setState({showIds: !this.state.showIds})}
              className="btn btn-link btn-sm">
              {this.state.showIds ? 'Hide' : 'Show'}
            </button>
            : null}

        </th>
      );
    }).toArray();

    const rows = csvMap.rest().map((row) => {
      const cols = row.map( (c, idx) => {
        return (<td>{ (idx === idIdx && !this.state.showIds) ? '...' : c}</td>);
      });

      return (
        <tr>
          {cols}
        </tr>);
    });
    return (
      <Table responsive className="table table-striped">
        <thead>
          <tr>
            {header}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  },

  renderError(error) {
    let message = error.get('message');
    const code = error.get('code');
    if (code < 500) {
      try {
        message = JSON.parse(message).message || message;
      } catch (e) {
        message = message;
      }
    }
    return (
      <div className="alert alert-danger">
        {message}
        <div>
          {code >= 500 ? error.get('exceptionId') : null}
        </div>
      </div>
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
