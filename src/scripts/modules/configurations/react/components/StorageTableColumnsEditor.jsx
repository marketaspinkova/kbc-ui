import React, {PropTypes} from 'react';
import {Table, Alert} from 'react-bootstrap';
import {fromJS} from 'immutable';
import classnames from 'classnames';
import storageApi from '../../../components/StorageApi';
import ColumnDataPreview from '../../../components/react/components/ColumnDataPreview';
import './StorageTableColumnsEditor.less';

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
      .tableDataJsonPreview(this.props.value.tableId, { limit: 10 })
      .then(json => {
        this.setState({
          loadingPreview: false,
          dataPreview: fromJS(json)
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
        }

        this.setState({
          loadingPreview: false,
          dataPreview: null,
          dataPreviewError
        });

        if (!dataPreviewError) {
          throw error;
        }
      });
  },

  renderHeaderCell(Element) {
    return (
      <Element
        showAdvanced={this.state.showAdvanced}
        onChangeShowAdvanced={(newValue) => this.setState({showAdvanced: newValue})}
      />
    );
  },

  render() {
    let headers = this.props.value.columnsMappings.map(mapping => mapping.title);
    return (
      <div>
        {!this.props.value.tableExist && (
          <Alert bsStyle="warning">
            <h4>Table Missing</h4>
            <p>
              Table <code>{this.props.value.tableId}</code> used in this configuration is missing in Storage. Running this configuration will fail.
            </p>
          </Alert>
        )}
        {this.props.value.columns.length > 0 && (
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
        )}
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
