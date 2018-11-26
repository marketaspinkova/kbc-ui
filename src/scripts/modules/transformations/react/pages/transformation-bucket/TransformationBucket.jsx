import React from 'react';
import Immutable from 'immutable';
import Router from 'react-router';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationsStore from '../../../stores/TransformationsStore';
import TransformationBucketsStore from '../../../stores/TransformationBucketsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import TransformationRow from '../../components/TransformationRow';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import TransformationActionCreators from '../../../ActionCreators';
import NewTransformationModal from '../../modals/NewTransformation';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import SidebarJobs from '../../../../components/react/components/SidebarJobs';
import SidebarVersions from '../../../../components/react/components/SidebarVersionsWrapper';
import VersionsStore from '../../../../components/stores/VersionsStore';
import EmptyStateBucket from '../../components/EmptyStateBucket';

export default React.createClass({
  mixins: [
    createStoreMixin(TransformationsStore, TransformationBucketsStore, LatestJobsStore, VersionsStore),
    Router.Navigation
  ],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('config');
    const latestVersions = VersionsStore.getVersions('transformation', bucketId);
    const latestVersionId = latestVersions.map(v => v.get('version')).max();

    return {
      bucketId,
      transformations: TransformationsStore.getTransformations(bucketId),
      bucket: TransformationBucketsStore.get(bucketId),
      pendingActions: TransformationsStore.getPendingActions(bucketId),
      latestJobs: LatestJobsStore.getJobs('transformation', bucketId),
      latestVersions,
      latestVersionId
    };
  },

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="row">
            <ComponentDescription
              componentId="transformation"
              configId={this.state.bucket.get('id')}
              placeholder="Describe transformation bucket"
            />
          </div>
          {this.state.transformations.count() ? this._renderTable() : <EmptyStateBucket bucket={this.state.bucket} />}
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata componentId="transformation" configId={this.state.bucketId} />
          </div>
          <ul className="nav nav-stacked">
            <li>
              <NewTransformationModal bucket={this.state.bucket} />
            </li>
            <li>
              <RunComponentButton
                title="Run transformations"
                tooltip="Run all transformations in bucket"
                component="transformation"
                mode="link"
                runParams={() => ({
                  configBucketId: this.state.bucketId
                })}
              >
                {`You are about to run all transformations in the bucket ${this.state.bucket.get('name')}.`}
              </RunComponentButton>
            </li>
            <li>
              <a onClick={this._deleteTransformationBucket}>
                <span className="fa kbc-icon-cup fa-fw" />
                {' Move to Trash'}
              </a>
            </li>
          </ul>
          <SidebarJobs
            componentId="transformation"
            configId={this.state.bucketId}
            jobs={this.state.latestJobs}
            limit={3}
          />
          <SidebarVersions limit={3} />
        </div>
      </div>
    );
  },

  _renderTable() {
    return (
      <div className="table table-striped table-hover">
        <span className="tbody">
          {this._getSortedTransformations()
            .map(transformation => {
              return (
                <TransformationRow
                  latestVersionId={this.state.latestVersionId}
                  transformation={transformation}
                  bucket={this.state.bucket}
                  pendingActions={this.state.pendingActions.get(transformation.get('id'), Immutable.Map())}
                  key={transformation.get('id')}
                />
              );
            })
            .toArray()}
        </span>
      </div>
    );
  },

  _getSortedTransformations() {
    const sorted = this.state.transformations.sortBy(function(transformation) {
      // phase with padding
      const phase = `0000${transformation.get('phase')}`.slice(-4);
      const name = transformation.get('name');
      return phase + name.toLowerCase();
    });
    return sorted;
  },

  _deleteTransformationBucket() {
    const bucketId = this.state.bucket.get('id');
    TransformationActionCreators.deleteTransformationBucket(bucketId);
    return this.transitionTo('transformations');
  }
});
