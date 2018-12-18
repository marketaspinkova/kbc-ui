import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import storageApi from '../../../components/StorageApi';
import {fromJS} from 'immutable';
import ColumnDataPreview from './ColumnDataPreview';
import classnames from 'classnames';
require('./StorageTableColumnsEditor.less');


export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      tableExist: PropTypes.bool,
      matchColumnKey: PropTypes.string,
      tableId: PropTypes.string,
      columns: PropTypes.any,
      columnsMappings: PropTypes.any,
      context: PropTypes.any,
      getInitialShowAdvanced: PropTypes.func,
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
      dataPreviewError: null,
      showAdvanced: this.props.value.getInitialShowAdvanced(this.props.value.columns)
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

  renderHeaderCell(Element) {
    return (
      <Element
        showAdvanced={this.state.showAdvanced}
        onChangeShowAdvanced={(newValue) => this.setState({showAdvanced: newValue})} />
    );
  },

  render() {
    let headers = this.props.value.columnsMappings.map(mapping => mapping.title);
    return (
      <div>
        { !this.props.value.tableExist &&
          <div className="alert alert-warning">
            <h3>Table Missing</h3>
            <div className="help-block">
              <span>
                Table <code>{this.props.value.tableId}</code> used in this configuration is missing in Storage. Running this configuration will fail.
              </span>
            </div>
          </div>
        }
        { this.props.value.columns.length > 0 &&
          <div>
            <h3>Columns</h3>
            <div className="storage-table-columns-editor-wrapper">

              <Table striped className="storage-table-columns-editor">
                <thead>
                  <tr>
                    <th className="col-md-2">Column Name</th>
                    {headers.map((title, index) => <th key={index}>{typeof title === 'string' ? title : this.renderHeaderCell(title)}</th>)}
                    <th className="col-md-1">Preview</th>
                  </tr>
                </thead>
                {this.renderBody()}
              </Table>
            </div>
          </div>
        }
      </div>
    );
  },

  onChangeColumn(newValue) {
    const {matchColumnKey} = this.props.value;
    const newColumns = this.props.value.columns.map(column => (column[matchColumnKey] === newValue[matchColumnKey] ? newValue : column));
    this.props.onChange({ columns: newColumns });
  },

  renderBody() {
    const {matchColumnKey} = this.props.value;
    return (
      <tbody>
        {this.props.value.columns.map((column, index) => (
          <tr key={index} className={classnames({danger: !this.props.value.isColumnValidFn(column)})}>
            <td className="column-name">{column[matchColumnKey]}</td>
            {this.props.value.columnsMappings.map((Mapping, mappingIndex) => (
              <td key={mappingIndex}>
                <Mapping.render
                  context={this.props.value.context}
                  disabled={this.props.disabled}
                  showAdvanced={this.state.showAdvanced}
                  column={column} onChange={this.onChangeColumn} />
              </td>
            ))}
            <td>
              <ColumnDataPreview
                columnName={column[matchColumnKey]}
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
