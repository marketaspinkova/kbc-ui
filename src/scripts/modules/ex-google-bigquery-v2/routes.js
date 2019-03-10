import React from 'react';

import createRoute  from '../configurations/utils/createRoute';
import columnTypes  from '../configurations/utils/columnTypeConstants';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

import QuerySection from './react/components/Query';
import queryAdapter from './adapters/query';

import SaveSettingsSection from './react/components/SaveSettings';
import saveSettingsAdapter from './adapters/saveSettings';

import ServiceAccountSection from './../wr-google-bigquery-v2/react/components/ServiceAccountSection';
import serviceAccountAdapter from './../wr-google-bigquery-v2/adapters/serviceAccount';

import UnloadSection from './react/components/Unload';
import unloadAdapter from './adapters/unload';

import {Check} from "@keboola/indigo-ui";

const routeSettings = {
  componentId: 'keboola.ex-google-bigquery-v2',
  componentType: 'extractor',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Google Service Account Key',
          contentComponent: ServiceAccountSection,
          options: { includeSaveButtons: true }
        }),
        onSave: serviceAccountAdapter.createConfiguration,
        onLoad: serviceAccountAdapter.parseConfiguration,
        isComplete: serviceAccountAdapter.isComplete
      },
      {
        render: CollapsibleSection({
          title: 'Unload Configuration',
          contentComponent: UnloadSection,
          options: { includeSaveButtons: true }
        }),
        onSave: unloadAdapter.createConfiguration,
        onLoad: unloadAdapter.parseConfiguration,
        isComplete: unloadAdapter.isComplete
      }
    ]
  },
  row: {
    hasState: false,
    name: {
      singular: 'Query',
      plural: 'Queries'
    },
    sections: [
      {
        render: QuerySection,
        onSave: queryAdapter.createConfiguration,
        onLoad: queryAdapter.parseConfiguration,
        onCreate: queryAdapter.createEmptyConfiguration
      },
      {
        render: SaveSettingsSection,
        onSave: saveSettingsAdapter.createConfiguration,
        onLoad: saveSettingsAdapter.parseConfiguration,
        onCreate: saveSettingsAdapter.createEmptyConfiguration
      }

    ],
    columns: [
      {
        name: 'Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.get('name', '');
        }
      },
      {
        name: 'Output Table',
        type: columnTypes.TABLE_LINK_DEFAULT_BUCKET,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'query', 'tableName'], '');
        }
      },
      {
        name: 'Incremental',
        type: columnTypes.VALUE,
        value: function(row) {
          return (
            <Check isChecked={row.getIn(['configuration', 'parameters', 'query', 'incremental'], false)} />
          );
        }
      },
      {
        name: 'Primary Key',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'query', 'primaryKey'], []).join(', ');
        }
      }
    ]
  }
};

const result = createRoute(routeSettings);

export default result;
