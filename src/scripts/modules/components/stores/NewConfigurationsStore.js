import Dispatcher from '../../../Dispatcher';
import * as Constants from '../Constants';
import { Map, fromJS } from 'immutable';
import StoreUtils, { initStore } from '../../../utils/StoreUtils';

let _store = initStore('NewConfigurationsStore', Map({
  configurations: Map(), // indexed by component id
  saving: Map()
}));

const _defaults = fromJS({
  'gooddata-writer': {
    domain: '',
    customDomain: false,
    name: '',
    description: '',
    pid: '',
    username: '',
    password: '',
    authToken: Constants.GoodDataWriterTokenTypes.DEMO,
    mode: Constants.GoodDataWriterModes.NEW,
    readModel: true
  }
});
// accessToken: '' DEPRECATED
// tokenType: Constants.GoodDataWriterTokenTypes.DEMO DEPRECATED

const getDefaultConfiguration = componentId =>
  _defaults.get(
    componentId,
    Map({
      name: '',
      description: ''
    })
  );

const NewConfigurationsStore = StoreUtils.createStore({
  getConfiguration(componentId) {
    return _store.getIn(['configurations', componentId], getDefaultConfiguration(componentId));
  },

  isValidConfiguration(componentId) {
    const configuration = this.getConfiguration(componentId);
    if (!configuration.get('name').trim()) {
      return false;
    }

    if (componentId === 'gooddata-writer') {
      switch (configuration.get('mode')) {
        case Constants.GoodDataWriterModes.NEW:
          if (Constants.isCustomAuthToken(configuration.get('authToken'))) {
            if (!configuration.get('authToken').trim()) {
              return false;
            }
          }
          break;
        case Constants.GoodDataWriterModes.EXISTING:
          if (!configuration.get('pid').trim()) {
            return false;
          }
          if (!configuration.get('password').trim()) {
            return false;
          }
          if (!configuration.get('username').trim()) {
            return false;
          }
          break;

        default:
          break;
      }
      if (configuration.get('customDomain')) {
        if (!configuration.get('domain').trim()) {
          return false;
        }
        if (!configuration.get('password').trim()) {
          return false;
        }
        if (!configuration.get('username').trim()) {
          return false;
        }
      }
    }
    return true;
  },

  isSavingConfiguration(componentId) {
    return _store.hasIn(['saving', componentId]);
  }
});

Dispatcher.register(payload => {
  const { action } = payload;

  switch (action.type) {
    case Constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_UPDATE:
      _store = _store.setIn(['configurations', action.componentId], action.configuration);
      return NewConfigurationsStore.emitChange();

    case Constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_CANCEL:
      _store = _store.deleteIn(['configurations', action.componentId]);
      return NewConfigurationsStore.emitChange();

    case Constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_START:
      _store = _store.setIn(['saving', action.componentId], true);
      return NewConfigurationsStore.emitChange();

    case Constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_ERROR:
      _store = _store.deleteIn(['saving', action.componentId]);
      return NewConfigurationsStore.emitChange();

    case Constants.ActionTypes.COMPONENTS_NEW_CONFIGURATION_SAVE_SUCCESS:
      _store = _store.withMutations(store =>
        store.deleteIn(['saving', action.componentId]).deleteIn(['configurations', action.componentId])
      );
      return NewConfigurationsStore.emitChange();

    default:
      break;
  }
});

export default NewConfigurationsStore;
