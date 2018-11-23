import React from 'react';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import WrGdriveStore from '../../../wrGdriveStore';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import AuthorizeAccount from '../../../../google-utils/react/AuthorizeAccount';

export default React.createClass({
  displayName: 'authorize',
  mixins: [createStoreMixin(WrGdriveStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const token = ApplicationStore.getSapiTokenString();

    return {
      gdriveComponent: ComponentsStore.getComponent('wr-google-drive'),
      configId,
      token
    };
  },

  render() {
    return (
      <AuthorizeAccount
        componentName="wr-google-drive"
        refererUrl={this._getReferrer()}
        isInstantOnly={true}
        isGeneratingExtLink={false}
        generateExternalLinkFn={function() {
          return false;
        }}
        sendEmailFn={function() {
          return false;
        }}
      />
    );
  },

  _getReferrer() {
    const { origin } = window.location;
    const basepath = ApplicationStore.getProjectPageUrl('writers/wr-google-drive');
    return `${origin}${basepath}/${this.state.configId}`;
  }
});
