import React from 'react';
import createReactClass from 'create-react-class';
import ApplicationStore from '../../stores/ApplicationStore';
import createStoreMixin from '../../react/mixins/createStoreMixin';
import LimitsSection from './LimitsSection';
import StorageApi from '../components/StorageApi';
import Keen from 'keen-js';
import SettingsTabs from '../../react/layout/SettingsTabs';

export default createReactClass({
  mixins: [createStoreMixin(ApplicationStore)],

  getInitialState() {
    return {
      client: null,
      isKeenReady: false
    };
  },

  componentDidMount() {
    StorageApi.getKeenCredentials().then(response => {
      const client = new Keen({
        readKey: response.keenToken,
        projectId: response.projectId
      });
      this.setState({
        client: client
      });
      Keen.ready(this.keenReady);
    });
  },

  getStateFromStores() {
    return {
      sections: ApplicationStore.getLimits(),
      canEdit: ApplicationStore.getKbcVars().get('canEditProjectLimits')
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <SettingsTabs active="settings-limits" />
          <div className="tab-content">
            <div className="tab-pane tab-pane-no-padding active">{this.renderSections()}</div>
          </div>
        </div>
      </div>
    );
  },

  renderSections() {
    if (!this.state.client) {
      return null;
    }

    return this.state.sections
      .map((section, index) => (
        <LimitsSection
          key={index}
          section={section}
          keenClient={this.state.client}
          isKeenReady={this.state.isKeenReady}
          canEdit={this.state.canEdit}
        />
      ))
      .toArray();
  },

  keenReady() {
    this.setState({
      isKeenReady: true
    });
  }
});
