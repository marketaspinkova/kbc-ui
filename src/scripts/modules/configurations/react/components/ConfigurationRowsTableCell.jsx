import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import StorageApiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';
import columnTypes from '../../../configurations/utils/columnTypeConstants';
import StorageApiBucketLink from '../../../components/react/components/StorageApiBucketLink';
import StorageApiFileUploadsLink from '../../../components/react/components/StorageApiFileUploadsLink';

const TableCell = React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    type: PropTypes.string.isRequired,
    valueFn: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired,
    component: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    configurationId: PropTypes.string.isRequired
  },

  render() {
    if (this.props.type === columnTypes.TABLE_LINK_DEFAULT_BUCKET) {
      const defaultBucketStage = this.props.component.getIn(['data', 'default_bucket_stage']);
      const sanitizedComponentId = this.props.component.get('id').replace(/[^a-zA-Z0-9-]/i, '-');
      const tableName = this.props.valueFn(this.props.row);
      const bucketId = defaultBucketStage + '.c-' + sanitizedComponentId + '-' + this.props.configurationId;
      if (!tableName) {
        return (<span onClick={e => e.stopPropagation()}>
          Unable to determine table name.<br />
          Check bucket
          {' '}<StorageApiBucketLink bucketId={bucketId}>{bucketId}</StorageApiBucketLink>
          {' '}or
          {' '}<StorageApiFileUploadsLink>File Uploads</StorageApiFileUploadsLink>
          .
        </span>);
      } else {
        const tableId = bucketId + '.' + tableName;
        return (
          <StorageApiTableLinkEx
            tableId={tableId}
          />
        );
      }
    } else if (this.props.type === columnTypes.TABLE_LINK) {
      const tableId = this.props.valueFn(this.props.row);
      if (!tableId) {
        return (<span>
          Unable to determine table name.
        </span>);
      } else {
        return (
          <StorageApiTableLinkEx
            tableId={tableId}
          />
        );
      }
    } else {
      return (
        <span>
          {this.props.valueFn(this.props.row)}
        </span>
      );
    }
  }
});

export default TableCell;
