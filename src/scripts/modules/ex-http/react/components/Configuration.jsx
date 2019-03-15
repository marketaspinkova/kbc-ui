import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { ControlLabel, FormControl, Col, FormGroup, Checkbox, HelpBlock } from 'react-bootstrap';
import CsvDelimiterInput from '../../../../react/common/CsvDelimiterInput';
import Select from '../../../../react/common/Select';

const columnsFromOptions = [
  {
    label: 'Set the header manually',
    value: 'manual'
  },
  {
    label: 'Read the header from the file(s) header',
    value: 'header'
  },
  {
    label: 'Create the header automatically',
    value: 'auto'
  }
];

export default createReactClass({
  mixins: [immutableMixin],

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
    return (
      <div className="form-horizontal">
        <h3>Download Settings</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Path</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.path}
              onChange={(e) => {
                this.props.onChange({path: e.target.value});
              }}
              placeholder="/myfolder/myfile.csv"
              disabled={this.props.disabled}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Checkbox
              checked={this.props.value.decompress}
              onChange={(e) => {
                this.props.onChange({decompress: e.target.checked});
              }}
              disabled={this.props.disabled}
            >
              Decompress
            </Checkbox>
            <HelpBlock>
              Decompress the downloaded file(s). All files in all archives will be imported into
              {' '}a single Storage table.
            </HelpBlock>
          </Col>
        </FormGroup>
        <h3>Save Settings</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Table Name</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.name}
              onChange={(e) => {
                this.props.onChange({name: e.target.value});
              }}
              placeholder="mytable"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Name of the table stored in Storage.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Checkbox
              checked={this.props.value.incremental}
              onChange={(e) => {
                this.props.onChange({incremental: e.target.checked});
              }}
              disabled={this.props.disabled}
            >
              Incremental Load
            </Checkbox>
            <HelpBlock>
              If incremental load is turned on, the table will be updated instead of rewritten.
              {' '}Tables with a primary key will have rows updated, tables without a primary key will have rows appended.
            </HelpBlock>
          </Col>
        </FormGroup>
        <CsvDelimiterInput
          type="text"
          value={this.props.value.delimiter}
          onChange={(value) => {
            this.props.onChange({delimiter: value});
          }}
          disabled={this.props.disabled}
        />
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Enclosure</Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.enclosure}
              onChange={(e) => {
                this.props.onChange({enclosure: e.target.value});
              }}
              placeholder={'"'}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Field enclosure used in the CSV file. The default value is <code>&quot;</code>.
            </HelpBlock>
          </Col>
        </FormGroup>
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
              onChange={(value) => {
                let diff = {
                  columnsFrom: value
                };
                if (value !== 'manual') {
                  diff.columns = [];
                }
                this.props.onChange(diff);
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
              onChange={(value) => {
                this.props.onChange({columns: value});
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
              onChange={(value) => {
                this.props.onChange({primaryKey: value});
              }}
              disabled={this.props.disabled}
            />
            <div className="help-block">If a primary key is set, updates can be done on the table by selecting <strong>incremental loads</strong>. The primary key can consist of multiple columns. The primary key of an existing table cannot be changed.</div>
          </div>
        </div>
      </div>
    );
  }
});
