import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { Table, Button, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Hint from '../../../../../react/common/Hint';
import FileSize from '../../../../../react/common/FileSize';
import Tooltip from '../../../../../react/common/Tooltip';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import ShareBucketModal from '../../modals/ShareBucketModal';
import { shareBucket, unshareBucket } from '../../../Actions';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    isSharing: PropTypes.bool.isRequired,
    isUnsharing: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      openShareModal: false,
      openUnshareModal: false
    };
  },

  render() {
    const bucket = this.props.bucket;

    return (
      <div>
        {this.renderDescription()}

        <Row>
          <Table responsive striped className="storage-table-overview">
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
              {bucket.get('lastChangeDate') && (
                <tr>
                  <td>Last change</td>
                  <td>
                    <CreatedWithIcon createdTime={bucket.get('lastChangeDate')} relative={false} />
                  </td>
                </tr>
              )}
              <tr>
                <td>Rows count</td>
                <td>
                  {bucket.get('rowsCount')}{' '}
                  {bucket.get('backend') === 'mysql' && (
                    <Hint title="Rows count">Number of rows is only an estimate.</Hint>
                  )}
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
        </Row>
      </div>
    );
  },

  renderDescription() {
    return (
      <MetadataEditField
        objectType="bucket"
        metadataKey="KBC.description"
        placeholder="Describe bucket"
        objectId={this.props.bucket.get('id')}
        editElement={InlineEditArea}
      />
    );
  },

  renderSourceBucket(bucket) {
    const source = bucket.get('sourceBucket', false);

    if (!source) {
      return (
        <tr>
          <td>Sharing</td>
          <td>
            {this.sharingInfo(bucket)} {this.sharingButtons(bucket)}
            {this.renderShareModal()}
            {this.renderUnshareModal()}
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td>Source bucket</td>
        {this.isOrganizationMember() ? (
          <td>
            <a href={`/admin/projects/${source.getIn(['project', 'id'])}`}>{source.getIn(['project', 'name'])}</a>
            {' / '}
            <a href={`/admin/projects/${source.getIn(['project', 'id'])}/storage#/buckets/${source.get('id')}`}>
              {source.get('id')}
            </a>{' '}
            <Hint title="Source bucket">Bucket is linked from other project.</Hint>
          </td>
        ) : (
          <td>
            {source.getIn(['project', 'name'])} / {source.get('id')}{' '}
            <Hint title="Source bucket">Bucket is linked from other project.</Hint>
          </td>
        )}
      </tr>
    );
  },

  renderLinkedBucket(linkedBucket, index) {
    const project = linkedBucket.get('project');

    return (
      <div key={index}>
        <CreatedWithIcon createdTime={linkedBucket.get('created')} relative={false} />{' '}
        {this.isOrganizationMember() ? (
          <span>
            <a href={`/admin/projects/${project.get('id')}`}>{project.get('name')}</a>
            {' / '}
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

  renderShareModal() {
    return (
      <ShareBucketModal
        show={this.state.openShareModal}
        bucket={this.props.bucket}
        isSharing={this.props.isSharing}
        onConfirm={this.handleShareBucket}
        onHide={this.closeShareModal}
      />
    );
  },

  renderUnshareModal() {
    return (
      <ConfirmModal
        show={this.state.openUnshareModal}
        buttonType="danger"
        buttonLabel="Disable"
        title="Bucket sharing"
        text={<p>Do you really want to stop bucket sharing?</p>}
        onConfirm={this.handleUnshareBucket}
        onHide={this.closeUnshareModal}
        isLoading={this.props.isUnsharing}
      />
    );
  },

  handleShareBucket(sharingType) {
    const bucketId = this.props.bucket.get('id');
    const params = { sharing: sharingType };

    return shareBucket(bucketId, params);
  },

  handleUnshareBucket() {
    const bucketId = this.props.bucket.get('id');

    return unshareBucket(bucketId);
  },

  sharingInfo(bucket) {
    if (bucket.get('sharing') === 'organization') {
      return 'Shared to organization. Only organization members are able to link the bucket to a project.';
    }

    if (bucket.get('sharing') === 'organization-project') {
      return "Shared to organization. Every organization's project member is able to link the bucket to a project.";
    }

    return 'Disabled';
  },

  sharingButtons(bucket) {
    const sharing = bucket.get('sharing');
    const canShareBucket = this.isOrganizationMember();
    const linked = bucket.get('linkedBy', Map());

    if (!sharing && canShareBucket) {
      return (
        <Button bsSize="small" onClick={this.openShareModal}>
          {this.props.isSharing ? <Loader /> : <i className="fa fa-share-square-o" />} Enable sharing
        </Button>
      );
    }

    if (sharing && canShareBucket && linked.count() === 0) {
      return (
        <Button bsSize="small" onClick={this.openUnshareModal}>
          {this.props.isUnsharing ? <Loader /> : <i className="fa fa-ban" />} Disable sharing
        </Button>
      );
    }

    if (sharing && canShareBucket && linked.count() > 0) {
      return (
        <Button bsSize="small" onClick={() => null} disabled={true}>
          <Tooltip tooltip="Please unlink linked buckets first" placement="top">
            <span>
              <i className="fa fa-ban" /> Disable sharing
            </span>
          </Tooltip>
        </Button>
      );
    }

    return null;
  },

  openShareModal() {
    this.setState({
      openShareModal: true
    });
  },

  closeShareModal() {
    this.setState({
      openShareModal: false
    });
  },

  openUnshareModal() {
    this.setState({
      openUnshareModal: true
    });
  },

  closeUnshareModal() {
    this.setState({
      openUnshareModal: false
    });
  },

  isOrganizationMember() {
    return this.props.sapiToken.getIn(['admin', 'isOrganizationMember'], false);
  }
});
