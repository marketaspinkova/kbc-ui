import store from '../components/stores/InstalledComponentsStore';
import {List, Map, fromJS} from 'immutable';
import fuzzy from 'fuzzy';
import * as templateFields from './credentials';
import _ from 'underscore';
import string from '../../utils/string';
import generateId from '../../utils/generateId';
import getDefaultPort from './defaultPorts';

const defaultSshPort = 22;

function fetch(componentId, configId) {
  const config = store.getConfigData(componentId, configId) || Map();
  return {
    config: config || Map(),
    parameters: config.get('parameters', Map()),
    localState: store.getLocalState(componentId, configId) || Map()
  };
}

export function isJsonValid(jsonString) {
  if (typeof jsonString !== 'string' || jsonString.trim().length === 0) {
    return false;
  }
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

export function isMappingValid(mapping) {
  if (Map.isMap(mapping)) {
    return isJsonValid(JSON.stringify(mapping.toJS()));
  } else {
    return isJsonValid(mapping);
  }
}

export function isValidQuery(query) {
  const mode = query.get('mode', 'mapping');
  const mapping = query.get('mapping', '');
  return query.get('name', '').trim().length > 0
    && query.get('collection', '').trim().length > 0

    && (query.get('query', '').toString().trim().length === 0
      || isJsonValid(query.get('query', '').toString()))
    && (query.get('sort', '').toString().trim().length === 0
      || isJsonValid(query.get('sort', '').toString()))

    && (mode === 'raw'
      || (mode === 'mapping' && isMappingValid(mapping))
    );
}

export function getLocalState(componentId, configId) {
  return fetch(componentId, configId).localState;
}

export const componentsStore = store;

export function createStore(componentId, configId) {
  const data = fetch(componentId, configId);


  return {
    hasValidCredentials(credentials) {
      const configCredentials = this.getCredentials();
      if (!credentials) {
        return false;
      }
      const hasSSH = true;
      const fields = templateFields.getFields();
      const validGeneralCreds = _.reduce(fields, (memo, field) => {
        let value = credentials.get(field.name, '');
        if (value) {
          value = value.toString();
        }
        const alreadySaved = !_.isEmpty(configCredentials.get(field.name));
        const isValueValid = !_.isEmpty(value) || (field.protected && alreadySaved);
        return memo && isValueValid;
      }, true);
      const ssh = credentials.get('ssh', Map());
      const sshFields = [
        {'name': 'sshHost', 'type': 'text'},
        {'name': 'user', 'type': 'text'},
        {'name': 'sshPort', 'type': 'number'}
      ];
      const isValidSSH = _.reduce(sshFields, (memo, field) => {
        let value = ssh.get(field.name, '');
        if (value) {
          value = value.toString();
        }
        return memo && !_.isEmpty(value);
      }, true);
      const hasKeys = ssh.getIn(['keys', 'public']) && ssh.getIn(['keys', '#private']);
      let sshValid = true;
      if (hasSSH && ssh.get('enabled')) {
        sshValid = hasKeys && isValidSSH;
      }
      return validGeneralCreds && sshValid;
    },

    // -------- LOCAL STATE manipulation -----------------
    getDefaultOutputTableId(query) {
      if (!query) {return ''; }
      const qname = string.sanitizeKbcTableIdString(query.get('name', ''));
      const bucketName = string.sanitizeKbcTableIdString(componentId);
      return `in.c-${bucketName}.${qname}`;
    },
    getQueriesPendingActions() {
      return data.localState.getIn(['pending'], Map());
    },

    getQueriesFilter() {
      return data.localState.get('queriesFilter', '');
    },

    isEditingCredentials() {
      return !!data.localState.get('editingCredentials');
    },

    isSavingCredentials() {
      return data.localState.get('isSavingCredentials', false);
    },

    isChangedCredentials() {
      return data.localState.get('isChangedCredentials', false);
    },

    getEditingCredentials() {
      return data.localState.get('editingCredentials');
    },

    isSavingNewQuery() {
      return data.localState.getIn(['newQueries', 'isSaving']);
    },

    isValidNewQuery() {
      const query = this.getNewQuery();
      return isValidQuery(query);
    },

    getNewCredentials() {
      var defaultNewCredentials = data.parameters.get('db', Map());
      if (!defaultNewCredentials.get('port')) {
        defaultNewCredentials = defaultNewCredentials.set('port', getDefaultPort(componentId));
      }
      if (!defaultNewCredentials.getIn(['ssh', 'sshPort'])) {
        defaultNewCredentials = defaultNewCredentials.setIn(['ssh', 'sshPort'], defaultSshPort);
      }

      const result = data.localState.get('newCredentials', defaultNewCredentials);
      if (result) {
        return result;
      } else {
        return defaultNewCredentials;
      }
    },

    getNewQuery(queryId = null) {
      const ids = this.getQueries().map((q) => q.get('id')).toJS();
      const defaultNewQuery = fromJS({
        enabled: true,
        incremental: false,
        mode: 'raw',
        collection: '',
        id: queryId !== null ? queryId : generateId(ids)
      });
      return data.localState.getIn(['newQueries', 'query'], defaultNewQuery);
    },

    getNewQueries() {
      return data.localState.getIn(['newQueries']);
    },

    getNewQueriesIdsList() {
      return data.localState.getIn(['newQueriesIdsList'], List([]));
    },

    isEditingQuery(queryId) {
      return !!data.localState.getIn(['editingQueries', queryId]);
    },

    getEditingQuery(queryId) {
      return data.localState.getIn(['editingQueries', queryId]);
    },

    getEditingQueries() {
      return data.localState.getIn(['editingQueries']);
    },

    isSavingQuery(queryId) {
      return !!data.localState.getIn(['isSaving', queryId]);
    },

    isChangedQuery(queryId) {
      return !!data.localState.getIn(['isChanged', queryId]);
    },

    isNewQuery(queryID) {
      return !!data.localState.getIn(['newQueries', queryID]);
    },

    outTableExist(query) {
      if (!query) {
        return false;
      }
      return !!this.getQueries().find((q) => {
        return q.get('name') === query.get('name') && q.get('id') !== query.get('id');
      });
    },

    isEditingQueryValid(queryId) {
      const query = this.getEditingQuery(queryId);
      if (!query) {
        return false;
      }

      return !this.outTableExist(query) && isValidQuery(query);
    },
    // -------- CONFIGDATA manipulation -----------------
    configData: data.config,

    getQueries() {
      return data.parameters.get('exports', List());
    },

    getQueriesFiltered() {
      const q = this.getQueriesFilter();
      return this.getQueries().filter( (query) => {
        return fuzzy.match(q, query.get('name'));
      }).sortBy((query) => query.get('name').toLowerCase());
    },

    getCredentials() {
      return data.parameters.get('db', Map());
    },

    getConfigQuery(qid) {
      if (this.isEditingQuery(qid)) {
        return this.getEditingQuery(qid);
      } else if (this.isNewQuery(qid)) {
        return this.getNewQuery(qid);
      }

      return this.getQueries().find((q) => q.get('id') === qid );
    },

    getLocalState() {
      return fetch(componentId, configId).localState;
    }

  };
}
