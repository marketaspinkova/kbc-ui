import React from 'react';
import Router, { Link } from 'react-router';
import classnames from 'classnames';
import { ExternalLink } from '@keboola/indigo-ui';
import TransformationDetailStatic from './TransformationDetailStatic';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationsStore from '../../../stores/TransformationsStore';
import TransformationBucketsStore from '../../../stores/TransformationBucketsStore';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import StorageBucketsStore from '../../../../components/stores/StorageBucketsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import VersionsStore from '../../../../components/stores/VersionsStore';
import TransformationsActionCreators from '../../../ActionCreators';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import Confirm from '../../../../../react/common/Confirm';
import CreateSandboxButton from '../../components/CreateSandboxButton';

import SqlDepButton from '../../components/SqlDepButton';
import ValidateQueriesButton from '../../components/ValidateQueriesButton';
import * as sandboxUtils from '../../../utils/sandboxUtils';

import LatestJobs from '../../../../components/react/components/SidebarJobs';
import LatestRowVersions from '../../../../components/react/components/SidebarVersionsRow';

export default React.createClass({
  mixins: [
    createStoreMixin(
      TransformationsStore,
      TransformationBucketsStore,
      StorageTablesStore,
      StorageBucketsStore,
      VersionsStore
    ),
    Router.Navigation,
    Router.State
  ],

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    let highlightQueryNumber;
    const bucketId = RoutesStore.getCurrentRouteParam('config');
    const transformationId = RoutesStore.getCurrentRouteParam('row');
    const versions = VersionsStore.getVersions('transformation', bucketId);
    const latestVersionId = versions.map(v => v.get('version')).max();

    if (RoutesStore.getRouter().getCurrentQuery().highlightQueryNumber) {
      highlightQueryNumber = parseInt(RoutesStore.getRouter().getCurrentQuery().highlightQueryNumber, 10);
    }

    return {
      bucket: TransformationBucketsStore.get(bucketId),
      transformation: TransformationsStore.getTransformation(bucketId, transformationId),
      editingFields: TransformationsStore.getTransformationEditingFields(bucketId, transformationId),
      pendingActions: TransformationsStore.getTransformationPendingActions(bucketId, transformationId),
      tables: StorageTablesStore.getAll(),
      buckets: StorageBucketsStore.getAll(),
      bucketId,
      transformationId,
      openInputMappings: TransformationsStore.getOpenInputMappings(bucketId, transformationId),
      openOutputMappings: TransformationsStore.getOpenOutputMappings(bucketId, transformationId),
      transformations: TransformationsStore.getTransformations(bucketId),
      isTransformationEditingValid: TransformationsStore.getTransformationEditingIsValid(bucketId, transformationId),
      highlightQueryNumber,
      latestVersionId
    };
  },

  getInitialState() {
    return { validateModalOpen: false };
  },

  resolveLinkDocumentationLink() {
    let subpageName;
    const documentationLink = 'https://help.keboola.com/manipulation/transformations/';
    const transformationType = this.state.transformation.get('type');

    if (transformationType === 'simple') {
      subpageName = this.state.transformation.get('backend');
    } else {
      subpageName = transformationType;
    }

    return documentationLink + subpageName;
  },

  _deleteTransformation() {
    const bucketId = this.state.bucket.get('id');
    this.transitionTo('transformationBucket', { config: bucketId });
    const transformationId = this.state.transformation.get('id');
    return TransformationsActionCreators.deleteTransformation(bucketId, transformationId);
  },

  _handleActiveChange(newValue) {
    let changeDescription;
    if (newValue) {
      changeDescription = `Transformation ${this.state.transformation.get('name')} enabled`;
    } else {
      changeDescription = `Transformation ${this.state.transformation.get('name')} disabled`;
    }
    return TransformationsActionCreators.changeTransformationProperty(
      this.state.bucketId,
      this.state.transformationId,
      'disabled',
      !newValue,
      changeDescription
    );
  },

  _showDetails() {
    return (
      (this.state.transformation.get('backend') === 'mysql' && this.state.transformation.get('type') === 'simple') ||
      (this.state.transformation.get('backend') === 'redshift' && this.state.transformation.get('type') === 'simple') ||
      (this.state.transformation.get('backend') === 'snowflake' &&
        this.state.transformation.get('type') === 'simple') ||
      this.state.transformation.get('backend') === 'docker'
    );
  },

  render() {
    const backend = this.state.transformation.get('backend');
    const transformationType = this.state.transformation.get('type');
    const { bucketId, latestVersionId } = this.state;

    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <TransformationDetailStatic
            bucket={this.state.bucket}
            transformation={this.state.transformation}
            editingFields={this.state.editingFields}
            transformations={this.state.transformations}
            pendingActions={this.state.pendingActions}
            tables={this.state.tables}
            buckets={this.state.buckets}
            bucketId={this.state.bucketId}
            transformationId={this.state.transformationId}
            openInputMappings={this.state.openInputMappings}
            openOutputMappings={this.state.openOutputMappings}
            showDetails={this._showDetails()}
            isEditingValid={this.state.isTransformationEditingValid}
            isQueriesProcessing={this.state.pendingActions.has('queries-processing')}
            highlightQueryNumber={this.state.highlightQueryNumber}
            highlightingQueryDisabled={this.state.validateModalOpen}
          />
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ul className="nav nav-stacked">
            <li>
              <Link
                to="transformationDetailGraph"
                params={{ row: this.state.transformation.get('id'), config: this.state.bucket.get('id') }}
              >
                <span className="fa fa-search fa-fw" />
                {' Overview'}
              </Link>
            </li>
            <li className={classnames({ disabled: this.state.transformation.get('disabled') })}>
              <RunComponentButton
                title="Run transformation"
                component="transformation"
                mode="link"
                disabled={this.state.transformation.get('disabled')}
                disabledReason={this.state.transformation.get('disabled') ? 'Transformation is disabled' : ''}
                runParams={() => ({
                  configBucketId: this.state.bucketId,
                  transformations: [this.state.transformation.get('id')]
                })}
              >
                {`You are about to run the transformation ${this.state.transformation.get('name')}.`}
              </RunComponentButton>
            </li>
            <li>
              <ActivateDeactivateButton
                mode="link"
                activateTooltip="Enable transformation"
                deactivateTooltip="Disable transformation"
                isActive={!this.state.transformation.get('disabled')}
                isPending={this.state.pendingActions.has('save-disabled')}
                onChange={this._handleActiveChange}
              />
            </li>
            {sandboxUtils.hasSandbox(backend, transformationType) && (
              <li>
                <CreateSandboxButton
                  backend={backend}
                  transformationType={transformationType}
                  runParams={sandboxUtils.generateRunParameters(this.state.transformation, bucketId, latestVersionId)}
                />
              </li>
            )}
            {(backend === 'redshift' ||
              (backend === 'mysql' && transformationType === 'simple') ||
              backend === 'snowflake') && (
              <li>
                <SqlDepButton
                  backend={backend}
                  bucketId={this.state.bucketId}
                  transformationId={this.state.transformationId}
                />
              </li>
            )}
            {backend === 'snowflake' && (
              <li>
                <ValidateQueriesButton
                  backend={backend}
                  bucketId={this.state.bucketId}
                  transformationId={this.state.transformationId}
                  modalOpen={this.state.validateModalOpen}
                  onModalOpen={() => {
                    return this.setState({ validateModalOpen: true });
                  }}
                  onModalClose={() => {
                    return this.setState({ validateModalOpen: false });
                  }}
                  isSaved={!this.state.editingFields.get('queriesChanged', false)}
                />
              </li>
            )}
            <li>
              <a>
                <Confirm
                  text="Delete transformation"
                  title={`Do you really want to delete the transformation ${this.state.transformation.get('name')}?`}
                  buttonLabel="Delete"
                  buttonType="danger"
                  onConfirm={this._deleteTransformation}
                >
                  <span>
                    <span className="fa kbc-icon-cup fa-fw" />
                    {' Delete transformation'}
                  </span>
                </Confirm>
              </a>
            </li>
            <li>
              <ExternalLink href={this.resolveLinkDocumentationLink()}>
                <span className="fa fa-question-circle fa-fw" />
                {' Documentation'}
              </ExternalLink>
            </li>
          </ul>
          <LatestJobs
            jobs={this.state.latestJobs}
            limit={3}
            showAllJobsLink={false}
          />
          <LatestRowVersions
            componentId="transformation"
            configId={this.state.bucketId}
            rowId={this.state.transformationId}
          />
        </div>
      </div>
    );
  }
});
