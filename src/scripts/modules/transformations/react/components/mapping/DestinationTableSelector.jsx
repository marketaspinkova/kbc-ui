import React, {PropTypes} from 'react';
import Select from 'react-select';
// import {FormControl} from 'react-bootstrap';
// import storageActions from '../../../../components/StorageActionCreators';

export default React.createClass({
  propTypes: {
    onSelect: PropTypes.func.isRequired,
    value: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired
  },

  /* componentDidMount() {
   *   storageActions.loadTablesForce();
   * },*/

  parseValue() {
    const value = this.props.value || '';
    const parts = value.match(/^(in|out)\.(.+)?\.(.+)?$/);
    return {
      stage: parts ? parts[1] : 'out',
      bucket: parts ? (parts[2] || '') : '',
      table: parts ? (parts[3] || '') : ''
    };
  },

  prepareBucketsOptions() {
    const stage = this.parseValue().stage;
    return this.props.buckets
               .filter(b => b.get('stage') === stage)
               .map(b => ({label: b.get('name'), value: b.get('name')}))
               .toList();
  },

  prepareTablesOptions() {
    const parsed = this.parseValue();
    const bucketId = parsed.stage + '.' + parsed.bucket;
    return this.props.tables
               .filter(t => t.getIn(['bucket', 'id']) === bucketId)
               .map(t => ({label: t.get('name'), value: t.get('name')}))
               .toList();
  },

  render() {
    const parsed = this.parseValue();
    return (
      <div className="form-group">
        <span className="col-xs-2">
          <Select
            searchable={false}
            key="stage-select"
            name="stage-select"
            disabled={this.props.disabled}
            clearable={false}
            value={parsed.stage}
            onChange={({value}) => this.selectStage(value)}
            options={['out', 'in'].map(v => ({label: v, value: v}))}
          />
        </span>
        <span className="col-xs-5">
          <Select.Creatable
            clearable={true}
            key="bucket-select"
            name="bucket-select"
            disabled={this.props.disabled}
            placeholder="Select bucket or create new"
            value={parsed.bucket}
            onChange={this.selectBucket}
            options={this.prepareBucketsOptions().toJS()}
          />
        </span>
        <span className="col-xs-5">
          <Select.Creatable
            clearable={true}
            key="table-select"
            name="table-select"
            disabled={this.props.disabled}
            placeholder="Select table or create new"
            value={parsed.table}
            onChange={this.selectTable}
            options={this.prepareTablesOptions().toJS()}
          />
        </span>

      </div>
    );
  },

  selectStage(stage) {
    this.updateValue('stage', stage);
  },

  selectBucket(selection) {
    const bucket = selection ? selection.value : '';
    this.updateValue('bucket', bucket);
  },

  selectTable(selection) {
    const tableName = selection ? selection.value : '';
    this.updateValue('table', tableName);
  },

  updateValue(partNameToUpdate, value) {
    const parsedParts = this.parseValue();
    const result = ['stage', 'bucket', 'table']
      .reduce((memo, partName) =>
        partName === partNameToUpdate ? `${memo}.${value}` : `${memo}.${parsedParts[partName]}`, '').slice(1);
    this.props.onSelect(result);
  }

});
