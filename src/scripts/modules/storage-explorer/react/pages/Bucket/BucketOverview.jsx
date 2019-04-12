import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Table, Button, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';

import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import CreatedWithIcon from '../../../../../react/common/CreatedWithIcon';
import Hint from '../../../../../react/common/Hint';
import FileSize from '../../../../../react/common/FileSize';
import Tooltip from '../../../../../react/common/Tooltip';
import ConfirmModal from '../../../../../react/common/ConfirmModal';
import ShareBucketModal from '../../modals/ShareBucketModal';
import ChangeSharingTypeModal from '../../modals/ChangeSharingTypeModal';
import ExternalProjectBucketLink from '../../components/ExternalProjectBucketLink';
import { shareBucket, unshareBucket, changeBucketSharingType } from '../../../Actions';

export default createReactClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired,
    isSharing: PropTypes.bool.isRequired,
    isUnsharing: PropTypes.bool.isRequired,
    isChangingSharingType: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      openShareModal: false,
      openUnshareModal: false,
      openChangeSharingModal: false
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
                  {bucket.get('rowsCount')}
                </td>
              </tr>
              <tr>
                <td>Data size</td>
                <td>
                  <FileSize size={bucket.get('dataSizeBytes')} />
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
        objectId={this.props.bucket.get('id')}
        metadata={this.props.bucket.get('metadata')}
        metadataKey="KBC.description"
        placeholder="Describe bucket"
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
            {this.renderChangeSharingTypeModal()}
            {this.renderUnshareModal()}
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td>Source bucket</td>
        <td>
          {this.isOrganizationMember() ? (
            this.renderBucketLink(source)
          ) : (
            <span>
              {source.getIn(['project', 'name'])} / {source.get('id')}
            </span>
          )}{' '}
          {this.props.sapiToken.getIn(['owner', 'id']) !== source.getIn(['project', 'id']) && (
            <Hint title="Source bucket">Bucket is linked from another project.</Hint>
          )}
        </td>
      </tr>
    );
  },

  renderBucketLink(bucket) {
    return this.props.sapiToken.getIn(['owner', 'id']) === parseInt(bucket.getIn(['project', 'id']), 10) ? (
      <Link
        to="storage-explorer-bucket"
        params={{
          bucketId: bucket.get('id')
        }}
      >
        {bucket.get('id')}
      </Link>
    ) : (
      <ExternalProjectBucketLink
        bucket={bucket}
        urlTemplates={this.props.urlTemplates}
      />
    );
  },

  renderLinkedBucket(linkedBucket, index) {
    return (
      <div key={index}>
        <CreatedWithIcon createdTime={linkedBucket.get('created')} relative={false} />{' '}
        {this.isOrganizationMember() ? (
          this.renderBucketLink(linkedBucket)
        ) : (
          <span>
            {linkedBucket.getIn(['project', 'name'])} / {linkedBucket.get('id')}
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

  renderChangeSharingTypeModal() {
    const bucketSharing = this.props.bucket.get('sharing', null);
    return (
      <ChangeSharingTypeModal
        key={`${this.props.bucket.get('id')}-${bucketSharing !== null ? bucketSharing : 'not-shared'}`}
        show={this.state.openChangeSharingModal}
        bucket={this.props.bucket}
        isChangingSharingType={this.props.isChangingSharingType}
        onConfirm={this.handleChangeSharingType}
        onHide={this.closeChangeSharingModal}
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

  handleChangeSharingType(sharingType) {
    const bucketId = this.props.bucket.get('id');
    const params = { sharing: sharingType };

    return changeBucketSharingType(bucketId, params);
  },

  handleUnshareBucket() {
    const bucketId = this.props.bucket.get('id');

    return unshareBucket(bucketId);
  },

  sharingInfo(bucket) {
    if (bucket.get('sharing') === 'organization') {
      return 'Shared to an organization. Only the organization members are able to link the bucket to a project.';
    }

    if (bucket.get('sharing') === 'organization-project') {
      return "Shared to an organization. Every organization's project member is able to link the bucket to a project.";
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
        <span>
          {this.renderChangeSharingTypeButton()}{' '}
          <Button bsSize="small" onClick={this.openUnshareModal}>
            {this.props.isUnsharing ? <Loader /> : <i className="fa fa-ban" />} Disable sharing
          </Button>
        </span>
      );
    }

    if (sharing && canShareBucket && linked.count() > 0) {
      return (
        <span>
          {this.renderChangeSharingTypeButton()}{' '}
          <Button bsSize="small" onClick={() => null} disabled={true}>
            <Tooltip tooltip="Please unlink linked buckets first" placement="top">
              <span>
                <i className="fa fa-ban" /> Disable sharing
              </span>
            </Tooltip>
          </Button>
        </span>
      );
    }

    return null;
  },

  renderChangeSharingTypeButton() {
    return (
      <Button
        bsSize="small"
        onClick={this.openChangeSharingModal}
        disabled={this.props.isChangingSharingType || this.props.isSharing || this.props.isUnsharing}
      >
        {this.props.isChangingSharingType ? <Loader /> : <i className="fa fa-edit" />} Change sharing type
      </Button>
    );
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

  openChangeSharingModal() {
    this.setState({
      openChangeSharingModal: true
    });
  },

  closeChangeSharingModal() {
    this.setState({
      openChangeSharingModal: false
    });
  },


  isOrganizationMember() {
    return this.props.sapiToken.getIn(['admin', 'isOrganizationMember'], false);
  }
});
