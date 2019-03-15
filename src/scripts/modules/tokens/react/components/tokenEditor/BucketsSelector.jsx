import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';

export default React.createClass({

  propTypes: {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    bucketPermissions: PropTypes.object.isRequired,
    allBuckets: PropTypes.object.isRequired,
    permission: PropTypes.string.isRequired,
    wrapperClassName: PropTypes.string
  },

  render() {
    return (
      <div className={this.props.wrapperClassName}>
        <Select
          placeholder={`Select buckets for ${this.props.permission} access`}
          multi={true}
          disabled={this.props.disabled}
          value={this.getSelectedPermissions()}
          onChange={this.handleSelect}
          valueRenderer={this.valueRenderer}
          options={this.getOptions()}
        />
        <span className="help-block">
          Token has <strong>{this.props.permission}</strong> access to the selected buckets.
        </span>
      </div>
    );
  },

  getSelectedPermissions() {
    return this.props
      .bucketPermissions.filter((perm) => perm === this.props.permission)
      .keySeq().toArray();
  },

  valueRenderer(op) {
    return op.value;
  },

  getOptions() {
    return this.props.allBuckets
      .filter((b, bid) => this.props.bucketPermissions.has(bid) ? this.props.bucketPermissions.get(bid) === this.props.permission : true)
      .sortBy((_, bid) => bid.toLowerCase())
      .map((b, bid) => ({key: bid, label: bid, value: bid})).toArray();
  },

  handleSelect(bucketsArray) {
    const perm = this.props.permission;
    const currentBucketPermissions = this.props.bucketPermissions.filter(p => p !== perm);
    const newPermissions = bucketsArray
      .map(o => o.value)
      .reduce((memo, bucketId) => memo.set(bucketId, perm), currentBucketPermissions);
    this.props.onChange(newPermissions);
  }

});
