import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { ControlLabel, FormGroup, HelpBlock, Checkbox, FormControl, Col } from 'react-bootstrap';
import CsvDelimiterInput from '../../../../react/common/CsvDelimiterInput';
import Select from '../../../../react/common/Select';
import {PanelWithDetails} from '@keboola/indigo-ui';

const columnsFromOptions = [
  {
    label: 'CSV file(s) contain(s) a header row',
    value: 'header'
  },
  {
    label: 'Set column names manually',
    value: 'manual'
  },
  {
    label: 'Generate column names as col_1, col_2, ...',
    value: 'auto'
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
      newFilesOnly: PropTypes.bool.isRequired,
      decompress: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired,
      delimiter: PropTypes.string.isRequired,
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

  renderCsvHeader() {
    if (this.props.value.columnsFrom === 'manual') {
      const props = this.props;
      return (
        <div className="form-group">
          <div className="col-xs-4 control-label">Column Names</div>
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
              disabled={this.props.disabled || this.props.value.columnsFrom === 'header'}
            />
            <span className="help-block">
              Specify the columns of the headerless files.
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
        <h3>Source</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>S3 Bucket</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.bucket}
              onChange={function(e) {
                props.onChange({bucket: e.target.value});
              }}
              placeholder="mybucket"
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Search Key</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.key}
              onChange={function(e) {
                props.onChange({key: e.target.value});
              }}
              placeholder="myfolder/myfile.csv"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Filename including folders or a prefix. Do not type <code>*</code> or <code>%</code> wildcards,
              {' '}use <strong>Wildcard</strong> checkbox instead.
            </HelpBlock>
          </Col>
        </FormGroup>
        <PanelWithDetails
          defaultExpanded={this.props.value.newFilesOnly || this.props.value.wildcard || this.props.value.subfolders}
          placement="bottom"
          labelOpen="Show additional source settings"
          labelCollapse="Hide additional source settings"
        >
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.value.newFilesOnly}
                onChange={function(e) {
                  props.onChange({newFilesOnly: e.target.checked});
                }}
                disabled={this.props.disabled}
              >
                New Files Only
              </Checkbox>
              <HelpBlock>
                Every job stores the timestamp of the last downloaded file and a subsequent job can pick up from there.
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.value.wildcard}
                onChange={function(e) {
                  let change = {wildcard: e.target.checked};
                  if (change.wildcard === false) {
                    change.subfolders = false;
                  }
                  props.onChange(change);
                }}
                disabled={this.props.disabled}
              >
                Wildcard
              </Checkbox>
              <HelpBlock>Match all files beginning with the specified key.</HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.value.subfolders}
                onChange={function(e) {
                  props.onChange({subfolders: e.target.checked});
                }}
                disabled={this.props.disabled || !this.props.value.wildcard}
              >
                Subfolders
              </Checkbox>
              <HelpBlock>Download subfolders recursively.</HelpBlock>
            </Col>
          </FormGroup>
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
          help={<span>Field delimiter used in CSV file. Use <code>\t</code> for tabulator.</span>}
        />
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Enclosure</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.enclosure}
              onChange={function(e) {
                props.onChange({enclosure: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>Field enclosure used in CSV file.</HelpBlock>
          </Col>
        </FormGroup>
        <div className="form-group">
          <div className="col-xs-4 control-label">Header</div>
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
                props.onChange({columnsFrom: value});
              }}
            />
          </div>
        </div>
        {this.renderCsvHeader()}
        <h3>Destination</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Storage Table Name</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.name}
              onChange={function(e) {
                props.onChange({name: e.target.value});
              }}
              placeholder="mytable"
              disabled={this.props.disabled}
            />
            <HelpBlock>Name of the table stored in Storage.</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Checkbox
              checked={this.props.value.incremental}
              onChange={function(e) {
                props.onChange({incremental: e.target.checked});
              }}
              disabled={this.props.disabled}
            >
              Incremental Load
            </Checkbox>
            <HelpBlock>
              If incremental load is turned on, table will be updated instead of rewritten. Tables with primary key will
              {' '}update rows, tables without primary key will append rows.
            </HelpBlock>
          </Col>
        </FormGroup>
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
        <h3>Processing Settings</h3>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Checkbox
              checked={this.props.value.decompress}
              onChange={function(e) {
                props.onChange({decompress: e.target.checked});
              }}
              disabled={this.props.disabled}
            >
              Decompress
            </Checkbox>
            <HelpBlock>
              Decompress downloaded file(s). All files in all archives will be imported into a single Storage table.
            </HelpBlock>
          </Col>
        </FormGroup>
        <PanelWithDetails
          defaultExpanded={this.props.value.addFilenameColumn || this.props.value.addRowNumberColumn}
          placement="bottom"
          labelOpen="Show additional processing settings"
          labelCollapse="Hide additional processing settings"
        >
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.value.addFilenameColumn}
                onChange={function(e) {
                  props.onChange({addFilenameColumn: e.target.checked});
                }}
                disabled={this.props.disabled}
              >
                Add Filename Column
              </Checkbox>
              <HelpBlock>
                Add an <code>s3_filename</code> column that will store the processed file name.
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={8} xsOffset={4}>
              <Checkbox
                checked={this.props.value.addRowNumberColumn}
                onChange={function(e) {
                  props.onChange({addRowNumberColumn: e.target.checked});
                }}
                disabled={this.props.disabled}
              >
                Add Row Number Column
              </Checkbox>
              <HelpBlock>
                Add an <code>s3_row_number</code> column that will store the row number from the processed file.
              </HelpBlock>
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </div>
    );
  }
});
