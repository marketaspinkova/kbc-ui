import React from 'react';
import ApplicationStore from '../../../stores/ApplicationStore';
import underscoreString from 'underscore.string';
import LimitsOverQuota from './LimitsOverQuota';
import Expiration from './Expiration';
import InstalledComponentStore from '../../components/stores/InstalledComponentsStore';
import TransformationsStore from '../../transformations/stores/TransformationsStore';
import TransformationBucketsStore from '../../transformations/stores/TransformationBucketsStore';
import componentsActions from '../../components/InstalledComponentsActionCreators';
import DeprecatedComponents from './DeprecatedComponents';
import FileSize from '../../../react/common/FileSize';
import TransformationParallelUnloads from './TransformationParallelUnloads';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import { showWizardModalFn } from '../../guide-mode/stores/ActionCreators';
import WizardStore from '../../guide-mode/stores/WizardStore';
import Desk from '../../guide-mode/react/Desk';
import lessons from '../../guide-mode/WizardLessons';
import { List } from 'immutable';
import ProjectDescription from './ProjectDescription';
import DeprecatedOAuth from './DeprecatedOAuth';
import oAuthComponents from '../../components/utils/oAuthComponents';

export default React.createClass({
  mixins: [
    createStoreMixin(InstalledComponentStore, TransformationsStore, WizardStore, TransformationBucketsStore)
  ],

  getStateFromStores() {
    const currentProject = ApplicationStore.getCurrentProject();
    const tokenStats = ApplicationStore.getTokenStats();
    const limits = ApplicationStore.getLimits().find(function(group) {
      return group.get('id') === 'connection';
    }).get('limits');
    const sizeBytes = limits.find(function(limit) {
      return limit.get('id') === 'storage.dataSizeBytes';
    }).get('metricValue');
    const rowsCount = limits.find(function(limit) {
      return limit.get('id') === 'storage.rowsCount';
    }).get('metricValue');
    return {
      tokens: tokenStats,
      projectId: currentProject.get('id'),
      projectDescription: currentProject.get('description'),
      data: {
        sizeBytes: sizeBytes,
        rowsCount: rowsCount
      },
      limitsOverQuota: ApplicationStore.getLimitsOverQuota(),
      expires: ApplicationStore.getCurrentProject().get('expires'),
      installedComponents: InstalledComponentStore.getAll(),
      transformations: TransformationsStore.getAllTransformations(),
      transformationBuckets: TransformationBucketsStore.getAll(),
      projectHasGuideModeOn: ApplicationStore.getKbcVars().get('projectHasGuideModeOn'),
      guideModeAchievedLessonId: WizardStore.getAchievedLessonId()
    };
  },

  componentDidMount() {
    componentsActions.loadComponents();
    componentsActions.loadComponentConfigsData('transformation');
    oAuthComponents.loadComponentsWithOAuth();
  },

  openLessonModal(lessonNumber) {
    showWizardModalFn(lessonNumber);
  },

  countOverviewComponent() {
    let componentCount = 0;
    if (this.state.projectHasGuideModeOn) {
      componentCount++;
    }
    componentCount += this.state.limitsOverQuota.count();
    componentCount += this.state.installedComponents.filter(function(component) {
      return !!component.get('flags', List()).contains('deprecated');
    }).count();
    if (typeof this.state.expires !== 'undefined') {
      componentCount += 1;
    }
    return componentCount;
  },

  getComponentsWithOAuth() {
    const installedComponents = this.state.installedComponents;
    return installedComponents.filter(component => {
      return component.get('flags', List()).contains('genericDockerUI-authorization')
        || component.get('id') === 'tde-exporter';
    });
  },

  render() {
    return (
      <div className="container-fluid">
        {this.countOverviewComponent() > 0  &&
        <div className="kbc-overview-component-container">
          {this.state.projectHasGuideModeOn && (
            <Desk
              lessons={lessons}
              achievedLessonId={this.state.guideModeAchievedLessonId}
              openLessonModalFn={this.openLessonModal}
            />
          )}
          <Expiration expires={this.state.expires}/>
          <LimitsOverQuota limits={this.state.limitsOverQuota}/>
          <DeprecatedOAuth
            components={this.getComponentsWithOAuth()}
          />
          {!ApplicationStore.hasCurrentProjectFeature('transformation-parallel-unloads') && (
            <TransformationParallelUnloads
              transformationBuckets={this.state.transformationBuckets}
              transformations={this.state.transformations}
            />
          )}
          <DeprecatedComponents
            components={this.state.installedComponents}
          />
        </div>
        }
        <div className="kbc-main-content">

          <ProjectDescription
            description={this.state.projectDescription}
          />

          <div className="table kbc-table-border-vertical kbc-layout-table kbc-overview">
            <div className="tbody">
              <div className="tr">
                <div className="td">
                  <h2>Storage</h2>
                  <h3 style={ {fontSize: '42px'} }><FileSize size={this.state.data.sizeBytes} /></h3>
                  <h3 style={ {fontSize: '24px'} }>{underscoreString.numberFormat(this.state.data.rowsCount)} <small>Rows</small>
                  </h3>
                </div>
                <div className="td">
                  <h2>Access</h2>
                  <h3 style={ {fontSize: '42px'} }>{this.state.tokens.get('adminCount')} <small style={ {fontSize: '16px'} }>Users</small>
                  </h3>
                  <h3 style={ {fontSize: '24px'} }>{this.state.tokens.get('totalCount') - this.state.tokens.get('adminCount')} <small>API Tokens</small>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
