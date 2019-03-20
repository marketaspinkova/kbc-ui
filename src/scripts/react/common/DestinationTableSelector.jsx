import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Select from 'react-select';
import stringUtils from '../../utils/string';
const { webalize } = stringUtils;


export default createReactClass({
  propTypes: {
    currentSource: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    parts: PropTypes.object.isRequired,
    updatePart: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired
  },

  prepareBucketsOptions() {
    const stage = this.props.parts.stage;
    const bucket = this.props.parts.bucket;
    const buckets = this.props.buckets
      .filter(b => b.get('stage') === stage)
      .map(b => ({label: b.get('name'), value: b.get('name')}))
      .toList();
    if (!!bucket && !buckets.find(b => b.label === bucket)) {
      return buckets.push({label: bucket, value: bucket});
    } else {
      return buckets;
    }
  },

  prepareTablesOptions() {
    const parts = this.props.parts;
    const bucketId = parts.stage + '.' + parts.bucket;
    const table = parts.table;
    let tables = this.props.tables
      .filter(t => t.getIn(['bucket', 'id']) === bucketId)
      .map(t => ({label: t.get('name'), value: t.get('name')}))
      .toList();
    if (!!table && !tables.find(t => t.label === table)) {
      tables = tables.push({label: table, value: table});
    }
    const {currentSource} = this.props;
    const webalizedSource = webalize(currentSource || '', {caseSensitive: true});
    if (!!webalizedSource && !tables.find(t => t.label === webalizedSource)) {
      tables = tables.insert(0, {label: `Create new table ${webalizedSource}`, value: webalizedSource});
    }

    return tables;
  },

  render() {
    const parts = this.props.parts;
    const stageSelect = (
      <Select
        searchable={false}
        disabled={this.props.disabled}
        clearable={false}
        value={parts.stage}
        onChange={({value}) => this.selectStage(value)}
        options={['out', 'in'].map(v => ({label: v, value: v}))}
      />
    );
    const bucketSelect = (
      <Select.Creatable
        promptTextCreator={label => label}
        clearable={true}
        disabled={this.props.disabled}
        placeholder="Select a bucket or create a new one"
        value={parts.bucket}
        onChange={this.selectBucket}
        options={this.prepareBucketsOptions().toJS()}
        autosize={false}
        newOptionCreator={this.selectBucketOptionCreator}
      />
    );

    const tableSelect = (
      <Select.Creatable
        promptTextCreator={label => label}
        clearable={true}
        disabled={this.props.disabled}
        placeholder="Select a table or create a new one"
        value={parts.table}
        onChange={this.selectTable}
        options={this.prepareTablesOptions().toJS()}
        autosize={false}
        newOptionCreator={this.selectTableOptionCreator}
      />
    );

    return (
      <div>
        <div className="kbc-dst-table-selector">
          <span className="kbc-select-stage">
            {stageSelect}
          </span>
          <span className="kbc-dot-separator">
            .
          </span>
          <span className="kbc-select-bucket">
            {bucketSelect}
          </span>
          <span className="kbc-dot-separator">
            .
          </span>
          <span className="kbc-select-table" >
            {tableSelect}
          </span>
        </div>
        <div className="help-block">{this.props.placeholder}</div>
      </div>
    );
  },

  selectStage(stage) {
    this.updateValue('stage', stage);
  },

  selectBucket(selection) {
    const bucket = selection ? selection.value || '' : '';
    if (!!bucket &&
        !bucket.startsWith('c-') &&
        !this.prepareBucketsOptions().find(b => b.label === bucket)) {
      this.updateValue('bucket', 'c-' + bucket);
    } else {
      this.updateValue('bucket', bucket);
    }
  },

  selectTable(selection) {
    const tableName = selection ? selection.value || '' : '';
    this.updateValue('table', tableName);
  },

  updateValue(partNameToUpdate, value) {
    this.props.updatePart(partNameToUpdate, value);
  },

  selectBucketOptionCreator({ label }) {
    const option = (label.startsWith('c-') ? '' : 'c-') + webalize(label, {caseSensitive: true});
    return {
      label: 'Create new bucket ' + option,
      value: option
    };
  },

  selectTableOptionCreator({ label }) {
    const option = webalize(label, {caseSensitive: true});
    return {
      label: 'Create new table ' + option,
      value: option
    };
  }
});
