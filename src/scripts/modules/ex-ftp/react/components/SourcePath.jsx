import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Input} from './../../../../react/common/KbcBootstrap';
import CsvDelimiterInput from '../../../../react/common/CsvDelimiterInput';
import Select from '../../../../react/common/Select';

const columnsFromOptions = [
  {
    label: 'Set header manually',
    value: 'manual'
  },
  {
    label: 'Read header from the file(s) header',
    value: 'header'
  },
  {
    label: 'Create header automatically',
    value: 'auto'
  }
];

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.shape({
      path: PropTypes.string.isRequired,
      onlyNewFiles: PropTypes.bool.isRequired,
      decompress: PropTypes.bool.isRequired,
      incremental: PropTypes.bool.isRequired,
      delimiter: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      enclosure: PropTypes.string.isRequired,
      columnsFrom: PropTypes.oneOf(['manual', 'header', 'auto']),
      columns: PropTypes.array.isRequired,
      primaryKey: PropTypes.array.isRequired,
      addRowNumberColumn: PropTypes.bool.isRequired,
      addFilenameColumn: PropTypes.bool.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },
  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <h3>Download settings</h3>
        <Input
          type="text"
          label="Path"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.path}
          onChange={function(e) {
            props.onChange({path: e.target.value});
          }}
          placeholder="folder/*.csv"
          disabled={this.props.disabled}
          help={(<span>Exact path to file or glob syntax. Use absolute path for FTP(s) connection and relative for SFTP connection.
            <ul>
              <li><code>**/*.csv</code> will download all CSV files in all subdirectories</li>
              <li><code>files/*.csv</code> will download all CSV files in files/ directory</li>
              <li><code>files/directory/file.txt</code> will download exact TXT file</li>
            </ul>
          </span>)}
        />
        <Input
          type="checkbox"
          label="Only New Files"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.onlyNewFiles}
          onChange={function(e) {
            props.onChange({onlyNewFiles: e.target.checked});
          }}
          disabled={this.props.disabled}
          help={(<span>Every job stores the timestamp of the last downloaded file and a subsequent job can pick up from there.</span>)}
        />
        <Input
          type="checkbox"
          label="Decompress"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.decompress}
          onChange={function(e) {
            props.onChange({decompress: e.target.checked});
          }}
          disabled={this.props.disabled}
          help={(<span>Decompress downloaded file(s). All files in all archives will be imported into a single Storage table.</span>)}
        />
        <h3>Save Settings</h3>
        <Input
          type="text"
          label="Table Name"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.name}
          onChange={function(e) {
            props.onChange({name: e.target.value});
          }}
          disabled={this.props.disabled}
          placeholder="mytable"
          help={(<span>Name of the table stored in Storage.</span>)}
        />
        <Input
          type="checkbox"
          label="Incremental Load"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.incremental}
          onChange={function(e) {
            props.onChange({incremental: e.target.checked});
          }}
          disabled={this.props.disabled}
          help={(<span>If incremental load is turned on, table will be updated instead of rewritten. Tables with primary key will update rows, tables without primary key will append rows.</span>)}
        />
        <CsvDelimiterInput
          type="text"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.delimiter}
          disabled={this.props.disabled}
          onChange={function(value) {
            props.onChange({delimiter: value});
          }}
          dis
        />
        <Input
          type="text"
          label="Enclosure"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.enclosure}
          disabled={this.props.disabled}
          onChange={function(e) {
            props.onChange({enclosure: e.target.value});
          }}
          placeholder={'"'}
          help={(<span>Field enclosure used in CSV file. Default value is <code>&quot;</code>.</span>)}
        />
        <h3>Header &amp; Primary Key</h3>
        <div className="form-group">
          <div className="col-xs-4 control-label">Read Header</div>
          <div className="col-xs-8">
            <Select
              name="columnsFrom"
              value={this.props.value.columnsFrom}
              multi={false}
              allowCreate={false}
              emptyStrings={false}
              searchable={false}
              clearable={false}
              options={columnsFromOptions}
              disabled={this.props.disabled}
              onChange={function(value) {
                let diff = {
                  columnsFrom: value
                };
                if (value !== 'manual') {
                  diff.columns = [];
                }
                props.onChange(diff);
              }}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-xs-4 control-label">Set Header</div>
          <div className="col-xs-8">
            <Select
              name="columns"
              value={this.props.value.columns}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder="Add a column"
              emptyStrings={false}
              onChange={function(value) {
                props.onChange({columns: value});
              }}
              disabled={this.props.value.columnsFrom !== 'manual' || this.props.disabled}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-xs-4 control-label">Primary Key</div>
          <div className="col-xs-8">
            <Select
              name="primaryKey"
              value={this.props.value.primaryKey}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder="Add a column to the primary key"
              emptyStrings={false}
              onChange={function(value) {
                props.onChange({primaryKey: value});
              }}
              disabled={this.props.disabled}
            />
            <div className="help-block">If primary key is set, updates can be done on table by selecting <strong>incremental loads</strong>. Primary key can consist of multiple columns. Primary key of an existing table cannot be changed.</div>
          </div>
        </div>
        <h3>Audit</h3>
        <Input
          type="checkbox"
          label="Filename"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.addFilenameColumn}
          onChange={function(e) {
            props.onChange({addFilenameColumn: e.target.checked});
          }}
          help={(<span>Add an <code>ftp_filename</code> column that will store the processed file name.</span>)}
          disabled={this.props.disabled}
        />
        <Input
          type="checkbox"
          label="Row Number"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.addRowNumberColumn}
          onChange={function(e) {
            props.onChange({addRowNumberColumn: e.target.checked});
          }}
          help={(<span>Add an <code>ftp_row_number</code> column that will store the row number from the processed file.</span>)}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
});
