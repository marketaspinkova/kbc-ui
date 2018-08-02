import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Input } from './../../../../react/common/KbcBootstrap';
import CsvDelimiterInput from '../../../../react/common/CsvDelimiterInput';
import Select from '../../../../react/common/Select';
import {PanelWithDetails} from '@keboola/indigo-ui';

const typeOptions = [
  {
    label: 'Full load',
    value: 'full'
  },
  {
    label: 'Full load, CSV without headers',
    value: 'full-headless'
  },
  {
    label: 'Incremental',
    value: 'incremental'
  },
  {
    label: 'Incremental, CSV without headers',
    value: 'incremental-headless'
  }
];

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      bucket: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      wildcard: PropTypes.bool.isRequired,
      subfolders: PropTypes.bool.isRequired,
      decompress: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
      delimiter: PropTypes.string.isRequired,
      enclosure: PropTypes.string.isRequired,
      columns: PropTypes.array.isRequired,
      primaryKey: PropTypes.array.isRequired,
      addRowNumberColumn: PropTypes.bool.isRequired,
      addFilenameColumn: PropTypes.bool.isRequired,
      type: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  renderLoadTypeHelp() {
    if (this.props.value.type === 'full') {
      return 'Gets all files from the specified S3 bucket and overwrites the output(?) table in Storage. All files are expected to have the same header.';
    }
    if (this.props.value.type === 'full-headless') {
      return 'Gets all files from the specified S3 bucket and overwrites the output table in Storage. The files must have the same structure and be without a header.';
    }
    if (this.props.value.type === 'incremental') {
      return 'Gets only new files from the S3 bucket and adds them to the output table in Storage. All non-empty files are expected to have the same header.';
    }
    if (this.props.value.type === 'incremental-headless') {
      return 'Gets only new files from the S3 bucket and adds them to the output table in Storage. The files must have the same structure and be without a header.';
    }
  },

  renderCsvHeaderHelp() {
    if (this.props.value.type === 'full-headless' || this.props.value.type === 'incremental-headless') {
      return 'Specify the columns of the headless files.';
    }
    if (this.props.value.type === 'incremental') {
      return 'Because incremental load can yield empty files, specify the header manually as well.';
    }
  },

  renderCsvHeader() {
    if (this.props.value.type !== 'full') {
      const props = this.props;
      return (
        <div className="form-group">
          <div className="col-xs-4 control-label">CSV Header</div>
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
              disabled={this.props.disabled || this.props.value.type === 'full'}
            />
            <span className="help-block">
              {this.renderCsvHeaderHelp()}
            </span>
          </div>
        </div>
      );
    }
  },

  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <h3>Job Settings</h3>
        <div className="form-group">
          <div className="col-xs-4 control-label">Load Type</div>
          <div className="col-xs-8">
            <Select
              name="type"
              value={this.props.value.type}
              multi={false}
              allowCreate={false}
              emptyStrings={false}
              searchable={false}
              clearable={false}
              options={typeOptions}
              disabled={this.props.disabled}
              onChange={function(value) {
                props.onChange({type: value});
              }}
            />
            <span className="help-block">
              {this.renderLoadTypeHelp()}
            </span>
          </div>
        </div>
        {this.renderCsvHeader()}
        <h3>Source</h3>
        <Input
          type="text"
          label="S3 Bucket"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.bucket}
          onChange={function(e) {
            props.onChange({bucket: e.target.value});
          }}
          placeholder="mybucket"
          disabled={this.props.disabled}
        />
        <Input
          type="text"
          label="Search Key"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.key}
          onChange={function(e) {
            props.onChange({key: e.target.value});
          }}
          placeholder="myfolder/myfile.csv"
          disabled={this.props.disabled}
          help={(<span>Filename including folders or a prefix. Do not type <code>*</code> or <code>%</code> wildcards, use <strong>Wildcard</strong> checkbox instead.</span>)}
          />
        <PanelWithDetails
          defaultExpanded={this.props.value.wildcard || this.props.value.subfolders}
          placement="bottom"
          >
          <Input
            type="checkbox"
            label="Wildcard"
            wrapperClassName="col-xs-8 col-xs-offset-4"
            checked={this.props.value.wildcard}
            onChange={function(e) {
              let change = {wildcard: e.target.checked};
              if (change.wildcard === false) {
                change.subfolders = false;
              }
              props.onChange(change);
            }}
            disabled={this.props.disabled}
            help={(<span>Match all files beginning with the specified key.</span>)}
            />
          <Input
            type="checkbox"
            label="Subfolders"
            wrapperClassName="col-xs-8 col-xs-offset-4"
            checked={this.props.value.subfolders}
            onChange={function(e) {
              props.onChange({subfolders: e.target.checked});
            }}
            disabled={this.props.disabled || !this.props.value.wildcard}
            help={(<span>Download subfolders recursively.</span>)}
            />
        </PanelWithDetails>
        <h3>CSV Settings</h3>
        <CsvDelimiterInput
          type="text"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.delimiter}
          onChange={function(value) {
            props.onChange({delimiter: value});
          }}
          disabled={this.props.disabled}
        />
        <Input
          type="text"
          label="Enclosure"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.enclosure}
          onChange={function(e) {
            props.onChange({enclosure: e.target.value});
          }}
          placeholder={'"'}
          disabled={this.props.disabled}
          help={(<span>Field enclosure used in CSV file. Default value is <code>"</code>.</span>)}
          />
        <h3>Destination</h3>
        <Input
          type="text"
          label="Storage Table Name"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.name}
          onChange={function(e) {
            props.onChange({name: e.target.value});
          }}
          placeholder="mytable"
          disabled={this.props.disabled}
          help={(<span>Name of the table stored in Storage.</span>)}
          />
        <PanelWithDetails
          defaultExpanded={this.props.value.primaryKey.length > 0}
          placement="bottom"
          >
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
        </PanelWithDetails>
        <h3>Processing Settings</h3>
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
        <PanelWithDetails
          defaultExpanded={this.props.value.addFilenameColumn || this.props.value.addRowNumberColumn}
          placement="bottom"
          >
          <Input
            type="checkbox"
            label="Add Filename Column"
            wrapperClassName="col-xs-8 col-xs-offset-4"
            checked={this.props.value.addFilenameColumn}
            onChange={function(e) {
              props.onChange({addFilenameColumn: e.target.checked});
            }}
            help={(<span>Add an <code>s3_filename</code> column that will store the processed file name.</span>)}
            disabled={this.props.disabled}
            />
          <Input
            type="checkbox"
            label="Add Row Number Column"
            wrapperClassName="col-xs-8 col-xs-offset-4"
            checked={this.props.value.addRowNumberColumn}
            onChange={function(e) {
              props.onChange({addRowNumberColumn: e.target.checked});
            }}
            help={(<span>Add an <code>s3_row_number</code> column that will store the row number from the processed file.</span>)}
            disabled={this.props.disabled}
            />
        </PanelWithDetails>
      </div>
    );
  }
});
