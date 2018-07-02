import React, { PropTypes } from 'react';
import storageApi from '../../../components/StorageApi';
import { fromJS } from 'immutable';
import ColumnDataPreview from './ColumnDataPreview';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      tableId: PropTypes.string,
      columns: PropTypes.any,
      columnsMappings: PropTypes.any,
      context: PropTypes.any,
      isColumnValidFn: PropTypes.func
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  componentDidMount() {
    if (this.props.value.tableId) this.fetchData();
  },

  getInitialState() {
    return {
      loadingPreview: false,
      dataPreview: null,
      dataPreviewError: null
    };
  },

  fetchData() {
    this.setState({
      loadingPreview: true
    });
    return storageApi
      .tableDataPreview(this.props.value.tableId, { limit: 10 })
      .then(csv => {
        this.setState({
          loadingPreview: false,
          dataPreview: fromJS(csv)
        });
      })
      .catch(error => {
        let dataPreviewError = null;
        if (error.response && error.response.body) {
          if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
            dataPreviewError = 'Data sample cannot be displayed. Too many columns.';
          } else {
            dataPreviewError = error.response.body.message;
          }
        } else {
          throw new Error(JSON.stringify(error));
        }
        this.setState({
          loadingPreview: false,
          dataPreview: null,
          dataPreviewError: dataPreviewError
        });
      });
  },

  render() {
    let headers = this.props.value.columnsMappings.map(mapping => mapping.title);
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Column</th>
            {headers.map((title, index) => <th key={index}>{title}</th>)}
            <th>Content Preview</th>
          </tr>
        </thead>
        {this.renderBody()}
      </table>
    );
  },

  onChangeColumn(newValue) {
    const newColumns = this.props.value.columns.map(column => (column.id === newValue.id ? newValue : column));
    this.props.onChange({ columns: newColumns });
  },

  renderBody() {
    return (
      <tbody>
        {this.props.value.columns.map((column, index) => (
          <tr key={index} className={!this.props.value.isColumnValidFn(column) ? 'danger' : ''}>
            <td>{column.id}</td>
            {this.props.value.columnsMappings.map((mapping, mappingIndex) => (
              <td key={mappingIndex}>
                <mapping.render
                  context={this.props.value.context}
                  disabled={this.props.disabled} column={column} onChange={this.onChangeColumn} />
              </td>
            ))}
            <td>
              <ColumnDataPreview
                columnName={column.id}
                tableData={this.state.dataPreview}
                error={this.state.dataPreviewError}
              />
            </td>
          </tr>
        ))}
      </tbody>
    );
  }
});
