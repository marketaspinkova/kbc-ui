import Dispatcher from '../Dispatcher';
import { Map, List, fromJS } from 'immutable';
import * as Constants from '../constants/KbcConstants';
import StoreUtils from '../utils/StoreUtils';
import composeLimits from './composeLimits';

let _store = Map({
  sapiToken: Map(),
  organizations: List(),
  sapiUrl: '',
  kbc: Map() // contains - projectBaseUrl, admin (object)
});

const ApplicationStore = StoreUtils.createStore({
  getSapiToken() {
    return _store.getIn(['sapiToken']);
  },

  getSapiTokenString() {
    return _store.getIn(['sapiToken', 'token']);
  },

  getSapiUrl() {
    return _store.get('sapiUrl');
  },

  getOrganizations() {
    return _store.get('organizations');
  },

  getMaintainers() {
    return _store.get('maintainers');
  },

  getNotifications() {
    return Map({
      url: this.getUrlTemplates().get('notifications'),
      unreadCount: _store.getIn(['notifications', 'unreadCount']),
      isEnabled: true
    });
  },

  getProjectTemplates() {
    return _store.get('projectTemplates');
  },

  getLimits() {
    return composeLimits(
      this.getSapiToken().getIn(['owner', 'limits']),
      this.getSapiToken().getIn(['owner', 'metrics'])
    );
  },

  getLimitsOverQuota() {
    return this.getLimits()
      .map(section => section.get('limits').map(limits => limits.set('section', section.get('title'))))
      .flatten(1)
      .filter(limit => limit.get('isAlarm'));
  },

  getTokenStats() {
    return _store.get('tokenStats');
  },

  getCurrentProjectId() {
    return _store.getIn(['sapiToken', 'owner', 'id']);
  },

  getCurrentProject() {
    return _store.getIn(['sapiToken', 'owner'], Map());
  },

  getCurrentProjectFeatures() {
    return this.getCurrentProject().get('features', List());
  },

  hasCurrentProjectFeature(feature) {
    return this.getCurrentProjectFeatures().includes(feature);
  },

  getCurrentAdmin() {
    return _store.getIn(['kbc', 'admin']);
  },

  hasCurrentAdminFeature(feature) {
    return this.getCurrentAdmin()
      .get('features')
      .includes(feature);
  },

  getProjectBaseUrl() {
    return _store.getIn(['kbc', 'projectBaseUrl']);
  },

  getScriptsBasePath() {
    return _store.getIn(['kbc', 'scriptsBasePath']);
  },

  getProjectPageUrl(path) {
    return this.getProjectBaseUrl() + '/' + path;
  },

  getUrlTemplates() {
    return _store.getIn(['kbc', 'urlTemplates']);
  },

  getXsrfToken() {
    return _store.getIn(['kbc', 'xsrfToken']);
  },

  getCanCreateProject() {
    return _store.getIn(['kbc', 'canCreateProject']);
  },

  getKbcVars() {
    return _store.getIn(['kbc']);
  },

  getProjectUrlTemplate() {
    return _store.getIn(['kbc', 'urlTemplates', 'project']);
  },

  hasLookerPreview() {
    return this.hasCurrentAdminFeature(Constants.FEATURE_UI_LOOKER_PREVIEW) || this.hasCurrentProjectFeature(Constants.FEATURE_UI_LOOKER_PREVIEW);
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.APPLICATION_DATA_RECEIVED:
      return (_store = _store.withMutations(store =>
        store
          .set('sapiToken', fromJS(action.applicationData.sapiToken))
          .set('sapiUrl', action.applicationData.sapiUrl)
          .set('kbc', fromJS(action.applicationData.kbc))
          .set('organizations', fromJS(action.applicationData.organizations))
          .set('maintainers', fromJS(action.applicationData.maintainers))
          .set('tokenStats', fromJS(action.applicationData.tokenStats))
          .set('notifications', fromJS(action.applicationData.notifications))
          .set('projectTemplates', fromJS(action.applicationData.projectTemplates))
      ));

    case Constants.ActionTypes.SAPI_TOKEN_RECEIVED:
      _store = _store.set('sapiToken', fromJS(action.sapiToken));
      return ApplicationStore.emitChange();

    default:
      break;
  }
});

export default ApplicationStore;
