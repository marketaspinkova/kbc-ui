import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Input } from './../../../../react/common/KbcBootstrap';
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
      decompress: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired,
      delimiter: PropTypes.string.isRequired,
      enclosure: PropTypes.string.isRequired,
      columnsFrom: PropTypes.oneOf(['manual', 'header', 'auto']),
      columns: PropTypes.array.isRequired,
      primaryKey: PropTypes.array.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <h3>Download Settings</h3>
        <Input
          type="text"
          label="Path"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.path}
          onChange={function(e) {
            props.onChange({path: e.target.value});
          }}
          placeholder="/myfolder/myfile.csv"
          disabled={this.props.disabled}
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
          placeholder="mytable"
          disabled={this.props.disabled}
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
          help={(<span>If incremental load is turned on, table will be updated instead of rewritten. Tables with primary key will update rows, tables without primary key will append rows.</span>)}
          disabled={this.props.disabled}
        />
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
      </div>
    );
  }
});
