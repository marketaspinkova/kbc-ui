import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Hint from '../../../../../react/common/Hint';
import FileSize from '../../../../../react/common/FileSize';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired
  },

  render() {
    const bucket = this.props.bucket;

    return (
      <Table responsive striped>
        <tbody>
          <tr>
            <td>ID</td>
            <td>{bucket.get('id')}</td>
          </tr>
          <tr>
            <td>Backend</td>
            <td>{bucket.get('backend')}</td>
          </tr>
          {this.renderSourceBucket(bucket)}
          {bucket.get('linkedBy') && (
            <tr>
              <td>Linked buckets</td>
              <td>{bucket.get('linkedBy').map(this.renderLinkedBucket)}</td>
            </tr>
          )}
          <tr>
            <td>Created</td>
            <td>
              <CreatedWithIcon createdTime={bucket.get('created')} relative={false} />
            </td>
          </tr>
          <tr>
            <td>Last change</td>
            <td>
              <CreatedWithIcon createdTime={bucket.get('lastChangeDate')} relative={false} />
            </td>
          </tr>
          <tr>
            <td>Rows count</td>
            <td>
              {bucket.get('rowsCount')}{' '}
              {bucket.get('backend') === 'mysql' && <Hint title="Rows count">Number of rows is only an estimate.</Hint>}
            </td>
          </tr>
          <tr>
            <td>Data size</td>
            <td>
              <FileSize size={bucket.get('dataSizeBytes')} />{' '}
              {bucket.get('backend') === 'mysql' && <Hint title="Data size">Data size is only an estimate.</Hint>}
            </td>
          </tr>
        </tbody>
      </Table>
    );
  },

  renderSourceBucket(bucket) {
    const source = bucket.get('sourceBucket', false);

    if (!source) {
      return (
        <tr>
          <td>Sharing</td>
          <td>
            <div className="kb-inline-edit kb-filter-edit">{this.bucketSharingInfo(bucket)}</div>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td>Source bucket</td>
        {this.isOrganizationMember() ? (
          <td>
            <a href={`/admin/projects/${source.getIn(['project', 'id'])}`}>{source.getIn(['project', 'name'])}</a> /
            <a href={`/admin/projects/${source.getIn(['project', 'id'])}/storage#/buckets/${source.get('id')}`}>
              {source.get('id')}
            </a>
            <Hint title="Source bucket">Bucket is linked from other project.</Hint>
          </td>
        ) : (
          <td>
            {source.getIn(['project', 'name'])} /{source.get('id')}
            <Hint title="Source bucket">Bucket is linked from other project.</Hint>
          </td>
        )}
      </tr>
    );
  },

  renderLinkedBucket(linkedBucket) {
    const project = linkedBucket.get('project');

    return (
      <div>
        <CreatedWithIcon createdTime={linkedBucket.get('created')} relative={false} />
        {this.isOrganizationMember() ? (
          <span>
            <a href={`/admin/projects/${project.get('id')}`}>{project.get('name')}</a> /
            <a href={`/admin/projects/${project.get('id')}/storage#/buckets/${linkedBucket.get('id')}`}>
              {linkedBucket.get('id')}
            </a>
          </span>
        ) : (
          <span>
            {project.get('name')} / {linkedBucket.get('id')}
          </span>
        )}
      </div>
    );
  },

  bucketSharingInfo(bucket) {
    if (bucket.get('sharing') === 'organization') {
      return 'Shared to organization. Only organization members are able to link the bucket to a project.';
    }

    if (bucket.get('sharing') === 'organization-project') {
      return "Shared to organization. Every organization's project member is able to link the bucket to a project.";
    }

    return 'Disabled';
  },

  isOrganizationMember() {
    return this.props.sapiToken.getIn(['admin', 'isOrganizationMember'], false);
  }
});
