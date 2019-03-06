import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import StorageApiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';
import columnTypes from '../../../configurations/utils/columnTypeConstants';
import StorageApiBucketLink from '../../../components/react/components/StorageApiBucketLink';
import StorageApiFileUploadsLink from '../../../components/react/components/StorageApiFileUploadsLink';

const TableCell = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    type: React.PropTypes.string.isRequired,
    valueFn: React.PropTypes.func.isRequired,
    row: React.PropTypes.object.isRequired,
    component: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired,
    configurationId: React.PropTypes.string.isRequired
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
